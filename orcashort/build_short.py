"""Cute Face, Killer Brain: How Orcas Really Hunt — a 9:16 short (1080x1920). All real footage, 9:16 windows cut from 1080p clips.
Writes index.html (one part) and usage.json. Voice: assets/vo.wav (pauses tightened)."""
import json
import lib as L
from lib import *

L.OUT_W, L.OUT_H = 1080, 1920
L.SHARPEN = ",unsharp=5:5:0.55:5:5:0.0"     # a light sharpen after the upscale from a ~608 px wide window
END = 50.57

CREDIT = {"abc_orca": "ABC News", "diver_cortez": "Silver Shark Adventures", "breach_mbww": "Monterey Bay Whale Watch", "res_super": "Mark Malleson",
          "blue_strike": "Whale Watch Western Australia", "car_devos": "Jacques de Vos", "portstar": "Good Morning South Africa", "starboard": "White Shark Ocean",
          "iceseal": "Laag Ni Ivan", "wavewash": "Lindblad Expeditions", "tr_punt": "Roll.Focus.", "sunfish_sn": "Science News", "sunfish_nbc": "NBC News / Hector Franz", "sunfish_mzdk": "mzdkTV",
          "gray_princess": "Princess Monterey", "gray_dww": "Discovery Whale Watch", "gray_mbww": "Monterey Bay Whale Watch", "tr_share": "Andrew Harpster",
          "res_jpod": "Orca Behavior Institute", "car_under": "Pierre Robert De Latour"}


def win(cx, y0=0.0, y1=1.0):
    """A 9:16 window from a 16:9 source, centred at cx (fraction of width), using rows y0..y1."""
    wf = (y1 - y0) * (9 / 16) / (16 / 9)
    x0 = min(max(cx - wf / 2, 0.0), 1.0 - wf)
    return (round(x0, 4), y0, round(x0 + wf, 4), y1)


def V(src, ss, cx, y0=0.0, y1=1.0, zoom=(1.0, 1.08), speed=1.0):
    def f(a, b):
        video(a, b, "yt:" + src, ss, speed, crop=win(cx, y0, y1), zoom=zoom, w=1080, h=1920)
        if src in CREDIT: layer(a, b, f'<div class="credit">Footage: {CREDIT[src]}</div>')
    return f


def A(name, **opts):
    """A vertical flat-animation scene from assets/js/vert.js (VS.name), drawn on a 1080x1920 canvas."""
    def f(a, b):
        ST["n"] += 1
        o = dict(opts, d=round(b - a, 3)); cid = nid("cv")
        html.append(f'<canvas id="{cid}" class="clip" width="1080" height="1920" data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="1" style="position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:{ST["n"]}"></canvas>')
        add_tl(f'{{const c=document.getElementById("{cid}").getContext("2d");tl.to({{}},{{duration:{b - a:.3f},ease:"none",onUpdate:function(){{VS.{name}(c,this.time(),{json.dumps(o)});}}}},{T(a)});}}')
    return f


SHOTS = [
    (0.00, V("car_under", 13.0, 0.6, zoom=(1.12, 1.04))),          # if this looks like a cute, oversized dolphin
    (2.55, V("diver_cortez", 14.0, 0.33)),                          # to you, be careful
    (4.15, V("breach_mbww", 30.5, 0.45, 0.0, 0.88)),               # this is the orca
    (5.35, V("res_super", 20.0, 0.5, 0.02, 0.84)),                  # the ocean's apex predator
    (7.25, V("blue_strike", 10.0, 0.56, 0.0, 0.84)),                           # calling it powerful
    (8.65, V("car_devos", 22.0, 0.3, 0.0, 0.88)),                   # undersells how smart it is
    (10.55, V("portstar", 105.0, 0.36, 0.0, 0.92)),                 # take sharks
    (11.55, V("portstar", 107.0, 0.38, 0.0, 0.92)),                 # orcas flip a shark upside down
    (13.65, A("trance")),                                                          # which sends it into a trance
    (15.25, A("liver")),                                                           # then they go straight for its liver
    (17.35, V("iceseal", 145.0, 0.55)),                             # seals on ice?
    (18.95, V("wavewash", 42.0, 0.45, 0.08, 1.0)),                  # the pod swims in together and makes a wave
    (21.55, V("wavewash", 48.0, 0.45, 0.08, 1.0)),                  # that sweeps the seal into the water
    (23.55, V("tr_punt", 36.0, 0.6, 0.0, 0.88)),                    # then they smack it into the air with their tails
    (26.35, V("sunfish_nbc", 47.0, 0.5, 0.02, 0.8)),                            # this year, scientists showed something new
    (28.85, A("sunfish", hit=3.8)),                           # one orca holds a sunfish still
    (33.15, V("sunfish_nbc", 86.0, 0.5, 0.02, 0.8)),                            # the fish explodes
    (34.55, V("res_super", 28.0, 0.62, 0.02, 0.84)),                # but the darkest hunt?
    (35.75, V("gray_princess", 25.0, 0.6, 0.0, 0.84)),              # a mother whale and her calf
    (37.45, V("gray_princess", 15.0, 0.4, 0.0, 0.84)),              # orcas chase them for hours
    (39.25, V("gray_dww", 20.0, 0.5, 0.02, 0.86)),                  # until the mother is too tired to protect her baby
    (41.95, V("gray_dww", 26.0, 0.52, 0.02, 0.86)),                 # then they kill the calf, right in front of her
    (44.45, V("tr_share", 15.0, 0.55)),                             # and young orcas learn every one of these tricks
    (46.75, V("res_jpod", 25.0, 0.55, 0.0, 0.88)),                  # by watching their elders
    (48.45, V("diver_cortez", 31.0, 0.42, zoom=(1.0, 1.06))),             # cute face
    (49.35, V("diver_cortez", 32.0, 0.42, zoom=(1.06, 1.16))),      # killer brain
]

CSS = """*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000;font-family:"Fredoka",sans-serif}
.scene{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden}
.vw{position:absolute;overflow:hidden}
.fit{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
.credit{position:absolute;left:44px;top:70px;font-family:"Fredoka";font-weight:600;font-size:26px;color:rgba(255,255,255,.85);text-shadow:0 2px 6px rgba(0,0,0,.8)}"""

if __name__ == "__main__":
    ST.update(off=0.0, n=10)
    for i, (a, fn) in enumerate(SHOTS):
        b = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else END
        fn(a, b)
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=block">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/flat.js"></script><script src="assets/js/shark.js"></script><script src="assets/js/vert.js"></script>
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END:.3f}" data-width="1080" data-height="1920">
{chr(10).join(html)}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {END:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>
'''
    (H / "index.html").write_text(doc, encoding="utf-8")
    json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
    print(len(html), "layers", len(SHOTS), "shots")
