"""The Blue-Ringed Octopus (Unseen By Eye). Footage first (CC BY YouTube dives, Pexels, Commons photos), flat-style explainers where detail is needed.
Writes parts/p1..pN.html and sfx.json. Voice: assets/audio/vo.wav (make_vo.py: cleaned, long pauses shortened)."""
import json, sys, re, html as html_mod
from lib import *
import sound

W2 = json.load(open(H / "words.json"))
VO_END = W2["duration"]
END = round((VO_END + 4.6) * 30) / 30
IMGS = {}
YT = {}
for f in (H / "assets" / "raw" / "yt").glob("*.info.json"):
    d = json.load(open(f, encoding="utf-8")); YT[d["id"]] = d.get("uploader") or d.get("channel") or "YouTube"

PHOTO_CREDIT = {}
try:
    for k, c in json.load(open(H / "assets" / "photo" / "credits.json", encoding="utf-8")).items():
        a = html_mod.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", c.get("artist") or ""))); a = html_mod.escape(re.sub(r"\s+", " ", a).strip())
        PHOTO_CREDIT[k] = f"Photo: {a[:50]} / Wikimedia Commons" if a else "Photo: Wikimedia Commons"
except Exception:
    pass


def V(src, ss=0, speed=1.0, ov=None, crop=None, **kw):
    def f(a, b):
        video(a, b, src if ":" in src else "px:" + src, ss, speed, crop=crop, **kw)
        if not ST["skip"]: sound.clip(a, b, src)
        extra = ""
        if src.startswith("yt:"): extra = credit(f"Video: {html_mod.escape(YT.get(src[3:], 'YouTube'))} (CC BY) / YouTube")
        o = (ov(a, b) if ov else "") + extra
        if o: layer(a, b, o)
    return f
def A(name, ov=None, **opts):
    def f(a, b):
        anim(a, b, name, **opts)
        if not ST["skip"]: sound.scene(a, b, name, opts)
        if ov: layer(a, b, ov(a, b))
    return f
def PH(name, ov=None, **kw):
    def f(a, b):
        if not ST["skip"]: sound.photo(a, b)
        layer(a, b, photo(a, b, name, **kw) + credit(PHOTO_CREDIT.get(name, "Photo: Wikimedia Commons")) + (ov(a, b) if ov else ""))
    return f
def both(*fs): return lambda a, b: "".join(f(a, b) or "" for f in fs)
def LB(text, t, x, y, side="left", size=50):
    def f(a, b):
        if not ST["skip"]: sound.lab(s(t))
        return label(text, s(t), x, y, side=side, size=size)
    return f
def FIN(d=1.2): return lambda a, b: fade_in_black(a, d)
def TT(text, t=None, dur=2.8, y=400, size=130):
    """chapter title over the shot (no silence): white Fredoka, blue drop shadow"""
    def f(a, b):
        t0 = a + 0.15 if t is None else s(t)
        if not ST["skip"]: sound.title(t0)
        return title(text, t0, t0 + dur, y=y, size=size)
    return f

exec(open(H / "shots.py", encoding="utf-8").read())
SHOTS = sorted([x for x in SHOTS if x[1] is not None], key=lambda x: s(x[0]))
_starts = [s(x[0]) for x in SHOTS]
PARTS = [0.0] + [round(max(t for t in _starts if t <= p + 0.01) * 30) / 30 for p in (150, 300, 455, 560)] + [END]
CSS = open(H / "style.css", encoding="utf-8").read()


def write_part(k):
    p0, p1 = PARTS[k], PARTS[k + 1]
    html.clear(); tl.clear()
    ST.update(off=p0, n=10)
    for i, (st, fn) in enumerate(SHOTS):
        a = s(st); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        ST["skip"] = not (p0 - 0.05 <= a < p1 - 0.05)
        if abs(a - p0) < 0.05: a = p0
        fn(a, b)
    ST["skip"] = False
    dur = p1 - p0
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=EB+Garamond&display=block">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/flat.js"></script><script src="assets/js/oct.js"></script>
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
    (H / "parts").mkdir(exist_ok=True)
    (H / "parts" / f"p{k + 1}.html").write_text(doc, encoding="utf-8")
    print(f"p{k + 1}.html  {p0:.2f}-{p1:.2f}  {len(html)} layers, {len(tl)} tweens")


if __name__ == "__main__":
    n = len(PARTS) - 1
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(n)
    for k in ks: write_part(k)
    if len(ks) == n:
        json.dump(sorted(sound.SND), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        anim_t = sum((s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END) - s(SHOTS[i][0]) for i in range(len(SHOTS)) if SHOTS[i][1].__qualname__.startswith("A."))
        print(len(sound.SND), "sound cues; animation share", round(100 * anim_t / END), "%")
