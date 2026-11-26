"""AI Equator: GPT-6.2 Astra review, white editorial style. Builds index.html from lib.py + scenes.py. Voice only, no music."""
from lib import H, html, tl
import scenes  # noqa: F401  (appends every scene)

END = 528.54
CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#fff}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#fff;font-family:Inter,sans-serif;color:#111;
  --ink2:#3F3F46;--ink3:#5F5F68;--line:#E4E4E7;--panel:#F6F6F7;--acc:#1D4ED8;--good:#15803D;--bad:#B91C1C}
.scene{position:absolute;inset:0;overflow:hidden}
.sc{position:absolute;inset:0;opacity:0}
.a{opacity:0}
.head{position:absolute;left:140px;right:140px;top:84px}
.kick{font:600 22px "JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--acc)}
.ttl{font-size:66px;font-weight:700;letter-spacing:-.025em;line-height:1.08;margin-top:14px;color:#111}
.body{position:absolute;left:140px;right:140px;top:268px;bottom:110px;display:flex;flex-direction:column;justify-content:center}
.body.full{top:96px}
.body.clipb{inset:0}
.srcl{position:absolute;left:140px;right:140px;bottom:44px;font-size:23px;color:var(--ink3)}
.row{display:flex;width:100%}
.col{display:flex;flex-direction:column}
.hrow{display:flex;width:100%}
.hd{font-weight:700;letter-spacing:-.025em;line-height:1.1}
.tx{line-height:1.35}
.ink2{color:var(--ink2)}.ink3{color:var(--ink3)}
.bg{font-weight:800;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums}
.acc{color:var(--acc);font-weight:inherit}
.good{color:var(--good)}.bad{color:var(--bad)}
.pill{display:inline-block;align-self:flex-start;font-size:34px;font-weight:600;padding:12px 26px;border-radius:999px;border:1.5px solid var(--line);background:#fff;color:#111}
.pill.acc{border-color:var(--acc);color:var(--acc)}
.pill.bad{border-color:var(--bad);color:var(--bad)}
.stat{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:34px 40px;min-width:0}
.stat.hero{background:#fff;border:2px solid var(--acc)}
.slab{font-size:30px;font-weight:600;color:var(--ink2);display:flex;align-items:center;gap:12px}
.slogo{height:36px;width:36px;object-fit:contain}
.sval{font-size:112px;font-weight:800;letter-spacing:-.04em;line-height:1.05;margin-top:10px;font-variant-numeric:tabular-nums}
.sval.hero{color:var(--acc)}
.ssub{font-size:28px;color:var(--ink3);margin-top:8px;line-height:1.3}
.quote{background:#fff;border:1px solid var(--line);border-left:5px solid var(--acc);border-radius:12px;padding:34px 40px}
.quote.bad{border-left-color:var(--bad)}
.quote.sm{padding:24px 34px}.quote.sm .qt{font-size:38px}.quote.sm .qwho{margin-top:12px}
.qt{font-size:46px;font-weight:600;line-height:1.3;letter-spacing:-.01em}
.qwho{display:flex;align-items:center;gap:14px;margin-top:18px}
.qwho b{display:block;font-size:28px}
.qwho span{display:block;font-size:24px;color:var(--ink3)}
.qav{width:64px;height:64px;border-radius:50%;object-fit:cover}
.fix{background:#FFF8EB;border:1.5px solid #E9B44C;border-radius:12px;padding:20px 26px}
.fk{font:700 21px "JetBrains Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:#8A5300}
.ft{font-size:31px;line-height:1.35;margin-top:8px;color:#2B2B2B}
.win{border-radius:12px;overflow:hidden;background:#fff;border:1px solid #D9D9DE;box-shadow:0 18px 50px rgba(17,17,17,.10)}
.wbar{height:42px;background:#F3F3F5;border-bottom:1px solid #E4E4E7;position:relative}
.wbar i{position:absolute;top:15px;width:12px;height:12px;border-radius:50%;background:#D4D4D8}
.wbar i:nth-child(1){left:18px}.wbar i:nth-child(2){left:38px}.wbar i:nth-child(3){left:58px}
.wbar span{position:absolute;left:50%;top:8px;transform:translateX(-50%);height:26px;padding:0 60px;background:#fff;border:1px solid #E4E4E7;border-radius:7px;font-size:15px;line-height:24px;color:#52525B;white-space:nowrap}
.wbody{overflow:hidden}.wbody img{display:block}
.twc img{display:block;border-radius:14px;border:1px solid #E1E1E6;box-shadow:0 14px 40px rgba(17,17,17,.08)}
.chartc{border-radius:14px;overflow:hidden;background:#000;box-shadow:0 14px 40px rgba(17,17,17,.12)}
.cbody{overflow:hidden}.cbody img{display:block}
.ccap{background:#fff;font-size:21px;color:var(--ink3);padding:12px 4px 0}
.pic img{display:block;border-radius:14px}
.pn{font-size:34px;font-weight:700;margin-top:14px}.pr{font-size:25px;color:var(--ink3);margin-top:2px}
.lg img{display:block}
.bars{display:flex;flex-direction:column;width:100%}
.brow{display:flex;align-items:center;gap:22px;min-height:68px}
.blab{display:flex;align-items:center;gap:16px;font-size:34px;font-weight:600;flex:none}
.blogo{width:40px;height:40px;object-fit:contain}
.btrack{flex:1;background:#F1F1F3;border-radius:8px;overflow:hidden}
.bfill{height:100%;background:#A1A1AA;border-radius:8px;transform-origin:0 50%}
.bfill.hero{background:var(--acc)}
.bval{flex:none;font-size:50px;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
.bsub{display:block;font-size:22px;font-weight:500;color:var(--ink3);letter-spacing:0;margin-top:4px}
.bnote{font-size:26px;color:var(--ink3);margin-top:22px}
.vframe{position:absolute;left:192px;top:88px;width:1536px;height:864px;border-radius:14px;background:#F1F1F3;box-shadow:0 18px 50px rgba(17,17,17,.12)}
.vcred{position:absolute;left:192px;top:968px;font-size:21px;color:var(--ink3)}
.vwrap{position:absolute;border-radius:14px;overflow:hidden;opacity:0}
.caps{position:absolute;left:36px;bottom:36px;display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.cap{background:#fff;color:#111;font-size:34px;font-weight:650;padding:12px 22px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
.cap.acc{color:var(--acc)}.cap.bad{color:var(--bad)}
.mono{font-family:"JetBrains Mono",monospace}
.div{height:1px;background:var(--line);width:100%}
.lvl{display:flex;gap:10px}
.lvl i{flex:1;height:70px;border-radius:10px;background:#E9E9EC;font:600 24px Inter,sans-serif;font-style:normal;color:var(--ink3);display:flex;align-items:center;justify-content:center}
.lvl i.on{background:var(--acc);color:#fff}
.lvl i.crit{background:var(--bad);color:#fff}
"""

doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>{CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1920" data-height="1080">
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
{chr(10).join(tl)}
tl.set({{}}, {{}}, {END});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(H / "index.html").write_text(doc, encoding="utf-8")
print(f"built {len(html)} scenes, {len(tl)} tweens")
