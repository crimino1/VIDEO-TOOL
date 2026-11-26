"""Bit by Bit EP4: Weird Computer Science Concepts (five living computers). Writes parts/p1..p4.html and sfx.json.
Voice public/vo.mp3 (564.70 s). Pixel scenes: assets/js/scenes/*.js on engine v2 assets/js/px.js; stock in stock/raw."""
import json, sys
from lib import *

END = 564.70
CSS = open(H / "style.css", encoding="utf-8").read()
SCENES = sorted(p.name for p in (H / "assets" / "js" / "scenes").glob("*.js"))


def R(word, after=0.0, plus=0.0, end=False):
    """Absolute word time (+plus) marked for conversion to shot-relative inside pixel options."""
    return A(W(word, after, end) + plus)


def _fx(fx, a):
    for name, t, *v in fx:
        tt = a + float(t[1:]) if isinstance(t, str) and t.startswith("+") else s(t)
        sfx(name, tt, v[0] if v else 1.0, v[1] if len(v) > 1 else None)


def P(kind, ov=None, fx=(), **o):
    """Pixel shot (+ optional DOM overlay). fx = [(name, time or "+rel", vol), ...]."""
    o.setdefault("tin", "zoom"); o.setdefault("tout", "zoom")
    def f(a, b):
        pxshot(a, b, kind, o)
        if ov: layer(a, b, ov(a, b))
        _fx(fx, a)
    return f


def L(*ovs, fx=()):
    """Overlay-only shot over the starfield."""
    def f(a, b):
        layer(a, b, "".join(o(a, b) for o in ovs))
        _fx(fx, a)
    return f


def M(poses, side="left", sub_=None, extra=None, h=640, fx=()):
    """Mascot shot. poses = [(t or None for shot start, pose)], sub_ = [(head, [body], t or None, end)], extra = overlay fn."""
    def f(a, b):
        ps = [(a if t is None else t, p) for t, p in poses]
        x = 600 if side == "left" else 140
        subs = "".join(sub(hd, bd, x, 380 if len(bd) < 2 else 330, a if t is None else t, e) for hd, bd, t, e in (sub_ or []))
        layer(a, b, mascot(a, b, ps, side, h) + subs + (extra(a, b) if extra else ""))
        _fx(fx, a)
    return f


def PH(name, ov=None, fx=(), **kw_):
    def f(a, b):
        layer(a, b, photo(a, b, name, **kw_) + (ov(a, b) if ov else ""))
        _fx(fx, a)
    return f


def SS(name, crop, hl=None, ov=None, fx=(("whoosh", "-0.05", 0.5),), **kw_):
    def f(a, b):
        h_ = None
        if hl: h_ = (s(hl[0]),) + tuple(hl[1:])
        layer(a, b, shot_ss(a, b, name, crop, hl=h_, **kw_) + (ov(a, b) if ov else ""))
        _fx([(n, a - 0.05 if t == "-0.05" else t, *v) for n, t, *v in fx], a)
    return f


SEC = lambda l1, l2: L(lambda a, b: sec(l1, l2, a))
K = lambda text, t=None, **k: (lambda a, b: kwl(text, a if t is None else t, **k))
KW = lambda words, **k: (lambda a, b: kw(words, **k))
OV = lambda *fs: (lambda a, b: "".join(f(a, b) for f in fs))
C = {"cyan": "#5fe3e8", "yel": "#f7c948", "pur": "#8a5cf6", "pink": "#f25ca8", "grn": "#3df56b", "org": "#f08a3c"}

def V(src, ss=0.0, ov=None, fx=(), **k):
    """Stock / screen-recording shot (stock/raw/<src>.mp4) with optional DOM overlay."""
    def f(a, b):
        video(a, b, src, ss, **k)
        if ov: layer(a, b, ov(a, b))
        _fx(fx, a)
    return f


def SECP(l1, l2, fx=()):
    """Section card over the synthwave backdrop scene."""
    def f(a, b):
        pxshot(a, b, "secbg", {"tin": "glitch", "tout": "zoom", "cam": {"z": [1.0, 1.04]}})
        layer(a, b, sec(l1, l2, a))
        _fx(fx, a)
    return f


CAM_IN = lambda z0=1.0, z1=1.18, x=320, y=180: {"z": [z0, z1], "x": [320, x], "y": [180, y]}
MON = {"z": [1.0, 1.7], "x": [320, 320], "y": [180, 152], "e": "io"}     # push into the room's monitor

exec(open(H / "shots_ep4.py", encoding="utf-8").read())


PARTS = [0.0, s("2:26.26"), s("4:29.66"), s("6:58.70"), END]


def write_part(k):
    p0, p1 = PARTS[k], PARTS[k + 1]
    html.clear(); tl.clear(); sps.clear()
    ST["off"] = p0
    for i, (t, fn) in enumerate(SHOTS):
        a = s(t); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        if b <= p0 + 0.01 or a >= p1 - 0.01: continue
        fn(max(a, p0), min(b, p1))
    dur = p1 - p0
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1920" data-height="1080">
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="bbRough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
<filter id="bbGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feColorMatrix in="b" values="0 0 0 0 0.37  0 0 0 0 0.89  0 0 0 0 0.91  0 0 0 0.55 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>
<canvas id="stars" width="1920" height="1080" style="z-index:0"></canvas>
<canvas id="crt" width="1920" height="1080" style="z-index:1"></canvas>
{chr(10).join(html)}
</div>
<script>window.PXS = {json.dumps(sps)};</script>
<script src="assets/js/px.js"></script>
{chr(10).join(f'<script src="assets/js/scenes/{f}"></script>' for f in SCENES)}
<script>PX.start();</script>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {dur:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>
'''
    (H / "parts").mkdir(exist_ok=True)
    (H / "parts" / f"p{k + 1}.html").write_text(doc, encoding="utf-8")
    print(f"p{k + 1}.html  {p0:.2f}-{p1:.2f}  {len(html)} layers, {len(tl)} tweens, {len(sps)} pixel shots")


if __name__ == "__main__":
    for i in range(1, len(SHOTS)):
        assert s(SHOTS[i][0]) > s(SHOTS[i - 1][0]), f"shot order {SHOTS[i - 1][0]} -> {SHOTS[i][0]}"
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(4)
    sfx_cues.clear()
    for k in ks: write_part(k)
    if len(ks) == 4:
        json.dump(sorted(sfx_cues), open(H / "sfx.json", "w"), indent=0)
        print(len(sfx_cues), "sound cues,", len(SHOTS), "shots")
