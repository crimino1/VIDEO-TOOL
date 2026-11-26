"""Orcas Kill These Animals and Never Eat Them (Unseen By Eye). Was: The Great White Shark Has One Weakness. Flat cartoon style. Writes parts/p1..p4.html, sfx.json and usage.json.
Voice: assets/vo.wav ("Kingdom" cut after "subscribe to Unseen"). Animation: assets/js/flat.js + shark.js + story.js. Stock: Pinterest clips (stock/raw) and Commons photos (assets/photo)."""
import json, sys, re, html as html_mod
from lib import *

END = 886.0
PARTS = [round(x * 30) / 30 for x in (0.0, s("3:38.18"), s("7:15.88"), s("10:51.68"), END)]

PHOTO_CREDIT = {}
try:
    for k, c in json.load(open(H / "assets" / "photo" / "credits.json", encoding="utf-8")).items():
        a = html_mod.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", c.get("artist") or ""))); a = html_mod.escape(re.sub(r"\s+", " ", a).strip())
        PHOTO_CREDIT[k] = f"Photo: {a[:60]} / Wikimedia Commons" if a else "Photo: Wikimedia Commons"
except Exception:
    pass


def V(src, ss=0, speed=1.0, ov=None, **kw):
    def f(a, b):
        ST["last"] = "v"
        video(a, b, "pin:" + src, ss, speed, **kw)
        if ov: layer(a, b, ov(a, b))
    return f


def A(name, ov=None, **opts):
    def f(a, b):
        anim(a, b, name, **opts)
        if name in ("deep", "pod", "gills", "senses", "size") and ST.get("last") not in ("deep", "pod", "gills", "senses", "size"): sfx("water_whoosh", a - 0.35, 0.3)
        ST["last"] = name
        if ov: layer(a, b, ov(a, b))
    return f


def S(fn, *args, **kw): return lambda a, b: layer(a, b, fn(a, b, *args, **kw))
def PH(name, ov=None, **kw):
    return lambda a, b: layer(a, b, photo(a, b, name, **kw) + credit(PHOTO_CREDIT.get(name, "Photo: Wikimedia Commons")) + (ov(a, b) if ov else ""))
def both(*fs): return lambda a, b: "".join(f(a, b) or "" for f in fs)
def ST_(text, t, end=None, **kw): return lambda a, b: ""   # captions removed at the user's request (2026-11-14)
def LB(text, t, x, y, **kw): return lambda a, b: label(text, t, x, y, **kw)
def FX(name, t, vol=1.0):
    def f(a, b):
        sfx(name, t, vol); return ""
    return f
def TT(text, t, end=None, y=380, size=130, sub=None):
    return lambda a, b: title(text, t, end or b - 0.1, y=y, size=size, sub=sub, sub_t=s(t) + 1.0)
def END_CARD(a, b):
    i, j = nid("en"), nid("eb")
    tw(f"#{i}", {"opacity": 1, "scale": 1}, a + 0.3, 0.7, {"opacity": 0, "scale": 0.8}, "back.out(2)")
    tw(f"#{j}", {"opacity": 1, "y": 0}, a + 1.2, 0.5, {"opacity": 0, "y": 30}, "back.out(2)")
    return f'<div id="{i}" class="endname" style="opacity:0">UNSEEN BY EYE</div><div id="{j}" class="endbtn" style="opacity:0">SUBSCRIBE</div>'


import re
exec(open(H / "shots.py", encoding="utf-8").read())
SHOTS = [x for x in SHOTS if x[1] is not None]
CSS = open(H / "style.css", encoding="utf-8").read()
FAMILY = {"water_whoosh": ("swell", 6, 25), "deep_boom": ("boom", 4, 6), "drone_swell": ("drone", 3, 25), "bubbles": ("bubbles", 3, 15),
          "sonar_ping": ("sonar", 3, 2), "thud": ("thud", 3, 3), "wave": ("wave", 1, 0), "breath": ("breath", 3, 0)}


def vary(cues):
    last_t, last_v, out = {}, {}, []
    for t, name, vol in cues:
        if vol <= 0 or name not in FAMILY:
            out.append([t, name, vol]); continue
        fam, n, gap = FAMILY[name]
        if t - last_t.get(fam, -1e9) < gap: continue
        v = (last_v.get(fam, 0) % n) + 1
        last_t[fam], last_v[fam] = t, v
        out.append([t, f"{fam}_{v}", vol])
    return out


def write_part(k):
    p0, p1 = PARTS[k], PARTS[k + 1]
    html.clear(); tl.clear()
    ST.update(off=p0, n=10)
    for i, (st, fn) in enumerate(SHOTS):
        a = s(st); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        ST["skip"] = not (p0 - 0.05 <= a < p1 - 0.05)
        if abs(a - p0) < 0.05: a = p0
        fn(a, b)
    for t_, nm, v in SFX_EXTRA:
        if p0 <= s(t_) < p1: sfx(nm, t_, v)
    ST["skip"] = False
    dur = p1 - p0
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=block">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/flat.js"></script><script src="assets/js/shark.js"></script><script src="assets/js/world.js"></script><script src="assets/js/story.js"></script><script src="assets/js/res.js"></script>
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1920" data-height="1080">
{chr(10).join(html)}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {dur:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>
'''
    (H / "parts" / f"p{k + 1}.html").write_text(doc, encoding="utf-8")
    print(f"p{k + 1}.html  {p0:.2f}-{p1:.2f}  {len(html)} layers, {len(tl)} tweens")


if __name__ == "__main__":
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(4)
    sfx_cues.clear()
    for k in ks: write_part(k)
    if len(ks) == 4:
        json.dump(vary(sorted(sfx_cues)), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        print(len(sfx_cues), "sound cues")
