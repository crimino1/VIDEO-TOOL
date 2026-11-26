"""Writes parts/p1..pN.html from shots.py (picture only; sound is mixed later by tools/mix.py).
Each part: one WebGL canvas (3D shots from assets/js/k_*.js) + HTML overlays (photos, portraits, cards, documentary text)."""
import glob, html, json, os, sys
from pathlib import Path
from PIL import Image

H = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(H))
from shots import SHOTS, FILM_END

CUTS = [161, 322, 484]   # part boundaries snap to the first shot start at/after these times
IMG, SMALL = H / "assets" / "img", H / "assets" / "img_s"
SMALL.mkdir(exist_ok=True)
CSS = (H / "assets" / "js" / "overlay.css").read_text(encoding="utf-8")
KJS = sorted(os.path.basename(p) for p in glob.glob(str(H / "assets" / "js" / "k_*.js")))


def img(name, maxw=1920):
    for ext in (".jpg", ".jpeg", ".png"):
        src = IMG / (name + ext)
        if src.exists():
            out = SMALL / (name + ".jpg")
            if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
                im = Image.open(src).convert("RGB"); im.thumbnail((maxw, maxw)); im.save(out, quality=90)
            return f"assets/img_s/{name}.jpg", Image.open(out).size
    raise SystemExit("missing image " + name)


starts = [s["start"] for s in SHOTS]
bounds = [0.0] + [min(t for t in starts if t >= c) for c in CUTS] + [FILM_END]
os.makedirs(H / "parts", exist_ok=True)
uid = [0]


def nid(p):
    uid[0] += 1
    return f"{p}{uid[0]}"


for k in range(len(bounds) - 1):
    P0, P1 = bounds[k], bounds[k + 1]
    shots = [s for s in SHOTS if P0 <= s["start"] < P1]
    body, tl, lab = [], [], []
    fade = lambda sel, t0, t1, d=0.6: (tl.append(f'tl.fromTo("{sel}",{{opacity:0}},{{opacity:1,duration:{d},ease:"power1.inOut"}},{t0:.3f});'),
                                       t1 is not None and tl.append(f'tl.to("{sel}",{{opacity:0,duration:0.5,ease:"power1.inOut"}},{t1 - 0.5:.3f});'))
    for i, s in enumerate(shots):
        a, b = s["start"] - P0, s["end"] - P0
        d = b - a
        sid = nid("s")
        inner = []
        if s["kind"] == "3d":
            lab.append([round(a, 3), round(b, 3), s["k"], {"mode": s["mode"], "FT0": s["start"]}])
            inner.append(f'<div class="black" id="{sid}k"></div>')
            tl.append(f'tl.fromTo("#{sid}k",{{opacity:1}},{{opacity:0,duration:0.45,ease:"power1.out"}},{a:.3f});')
            if any(o[0] in ("line", "cap", "eq") for o in s["ov"]):
                inner.append('<div class="fadeb" style="opacity:.55"></div>')
            inner.append('<div class="vig"></div>')
        elif s["kind"] == "v":
            f = f'assets/clips/{s["clip"]}_{int(s["start"])}.mp4'
            assert (H / f).exists(), "run tools/cut_clips.py first: " + f
            body.append(f'<video id="{sid}v" class="clip" src="{f}" muted playsinline data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="4" '
                        f'style="position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover;z-index:5"></video>')
            inner.append(f'<div class="black" id="{sid}k"></div>')
            tl.append(f'tl.fromTo("#{sid}k",{{opacity:1}},{{opacity:0,duration:0.4,ease:"power1.out"}},{a:.3f});')
            if s["ov"]:
                inner.append('<div class="fadeb"></div>')
            inner.append('<div class="vig"></div>')
        elif s["kind"] == "f":
            src, (w, h) = img(s["img"], 2000)
            sc = min(1500 / w, 740 / h)
            fw, fh = int(w * sc), int(h * sc)
            if any(o[0] == "capt" for o in s["ov"]) and (1920 - fw) // 2 < 720:  # wide image would cover the top caption
                sc = min(1500 / w, 620 / h); fw, fh = int(w * sc), int(h * sc)
            kb = nid("kb")
            inner.append(f'<div class="black"></div><div id="{kb}" style="position:absolute;left:{(1920 - fw) // 2}px;top:{(1080 - fh) // 2 - 40 + (50 if any(o[0] == 'capt' for o in s['ov']) else 0)}px;width:{fw}px;height:{fh}px;'
                         f'box-shadow:0 30px 90px rgba(0,0,0,.7)"><img src="{src}" alt="{s["img"]}" style="width:100%;height:100%;object-fit:contain"></div><div class="vig"></div>')
            tl.append(f'tl.fromTo("#{kb}",{{scale:1.0,y:6}},{{scale:1.09,y:-6,duration:{d:.3f},ease:"sine.inOut"}},{a:.3f});')
            fade(f"#{sid}", a, None, 0.45)
        elif s["kind"] == "p":
            src, _ = img(s["img"])
            kb = nid("kb")
            inner.append(f'<div class="photo"><div id="{kb}" style="position:absolute;inset:0"><img src="{src}" alt="{s["img"]}"></div><div class="fadeb"></div><div class="vig"></div></div>')
            tl.append(f'tl.fromTo("#{kb}",{{scale:1.0}},{{scale:1.08,duration:{d:.3f},ease:"none"}},{a:.3f});')
            fade(f"#{sid}", a, None, 0.45)
        elif s["kind"] == "q":
            n = len(s["imgs"])
            inner.append('<div class="black"></div>')
            have = all(any((IMG / (m + e)).exists() and (IMG / (m + e)).stat().st_size > 0 for e in (".jpg", ".jpeg", ".png")) for m in s["imgs"])
            if not have:  # no free photo exists: names only, as typography
                colw = 1600 // n
                for j, (nm, meta) in enumerate(s["names"]):
                    t_id = nid("pn")
                    x = 160 + j * colw
                    rule = f'<div style="position:absolute;left:{x - 40}px;top:400px;width:1px;height:240px;background:rgba(241,239,233,.3)"></div>' if j else ""
                    inner.append(f'{rule}<div id="{t_id}" style="opacity:0"><div class="pname" style="left:{x}px;top:430px;width:{colw - 80}px;font-size:84px">{html.escape(nm)}</div>'
                                 f'<div class="pmeta" style="left:{x}px;top:{430 + 110}px">{html.escape(meta)}</div></div>')
                    fade(f"#{t_id}", a + 0.35 + 0.45 * j, None, 0.9)
                    tl.append(f'tl.fromTo("#{t_id}",{{scale:0.97}},{{scale:1.04,duration:{d:.3f},ease:"none"}},{a:.3f});')  # name-only card: slow push, never a freeze
            elif n == 1:
                src, (w, h) = img(s["imgs"][0], 1400)
                pw = min(int(840 * w / h), 680)
                kb = nid("kb")
                inner.append(f'<div class="port" style="right:200px;width:{pw}px"><img id="{kb}" src="{src}" alt="{s["imgs"][0]}"></div>')
                tl.append(f'tl.fromTo("#{kb}",{{scale:1.0,x:0}},{{scale:1.10,x:-18,duration:{d:.3f},ease:"none"}},{a:.3f});')
                nm, meta = s["names"][0]
                t_id = nid("pn")
                inner.append(f'<div id="{t_id}" style="opacity:0"><div class="pname" style="left:160px;top:440px;max-width:{1920 - pw - 460}px">{html.escape(nm)}</div>'
                             f'<div class="pmeta" style="left:160px;top:{440 + (90 if len(nm) < 20 else 170)}px">{html.escape(meta)}</div></div>')
                fade(f"#{t_id}", a + 0.35, None, 0.8)
            else:
                W_ = {2: 560, 3: 440}[n]; Hh = {2: 680, 3: 560}[n]; gap = {2: 140, 3: 90}[n]
                x0 = (1920 - (n * W_ + (n - 1) * gap)) / 2
                for j, name in enumerate(s["imgs"]):
                    src, _ = img(name, 1200)
                    kb, t_id = nid("kb"), nid("pn")
                    x = x0 + j * (W_ + gap)
                    inner.append(f'<div class="port" style="left:{x:.0f}px;top:150px;width:{W_}px;height:{Hh}px"><img id="{kb}" src="{src}" alt="{name}"></div>')
                    tl.append(f'tl.fromTo("#{kb}",{{scale:1.0}},{{scale:1.08,duration:{d:.3f},ease:"none"}},{a:.3f});')
                    nm, meta = s["names"][j]
                    inner.append(f'<div id="{t_id}" style="opacity:0"><div class="pname" style="left:{x:.0f}px;top:{150 + Hh + 34}px;width:{W_}px;text-align:center;font-size:{50 if n == 2 else 42}px">{html.escape(nm)}</div>'
                                 f'<div class="pmeta" style="left:{x:.0f}px;top:{150 + Hh + 34 + (70 if n == 2 else 60)}px;width:{W_}px;text-align:center;font-size:22px">{html.escape(meta)}</div></div>')
                    fade(f"#{t_id}", a + 0.35 + 0.35 * j, None, 0.8)
            fade(f"#{sid}", a, None, 0.45)
        else:  # card
            inner.append('<div class="black"></div>')
            fade(f"#{sid}", a, None, 0.45)
        # documentary text
        for o in s["ov"]:
            typ = o[0]
            t0, t1 = o[-2] - P0, (o[-1] - P0 if o[-1] is not None else None)
            t0 = max(t0, a)
            if t1 is None or t1 > b:
                t1 = b
            oid = nid("o")
            if typ in ("line", "cap", "capt"):
                inner.append(f'<div id="{oid}" class="{typ}" style="opacity:0">{html.escape(o[1])}</div>')
            elif typ == "eq":
                sub = f'<div class="eqs">{html.escape(o[2])}</div>' if o[2] else ""
                inner.append(f'<div id="{oid}" class="eqw" style="opacity:0"><div class="eq">{o[1]}</div>{sub}</div>')
            elif typ == "big":
                sm = f"<small>{html.escape(o[2])}</small>" if o[2] else ""
                inner.append(f'<div id="{oid}" class="big" style="opacity:0">{o[1]}{sm}</div>')
                if s["kind"] == "card":  # slow push so a held card never reads as a freeze
                    tl.append(f'tl.fromTo("#{oid}",{{scale:0.97}},{{scale:1.04,duration:{t1 - t0 + 0.9:.3f},ease:"none"}},{t0:.3f});')
            elif typ == "title":
                inner.append(f'<div id="{oid}" class="title" style="opacity:0"><div class="t1">{html.escape(o[1])}</div><div class="t2">{html.escape(o[2])}</div><div class="t3">{html.escape(o[3])}</div></div>')
            fade(f"#{oid}", t0, t1 if t1 < b - 0.05 else None, 0.9 if typ in ("title", "big") else 0.7)
        z = 3 if s["kind"] == "3d" else 6
        body.append(f'<div id="{sid}" class="clip" data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="{2 if s["kind"] == "3d" else 3}" '
                    f'style="position:absolute;inset:0;z-index:{z};{"" if s["kind"] in ("3d", "v") else "opacity:0;"}" data-layout-allow-overflow data-layout-allow-overlap>{"".join(inner)}</div>')
    dur = P1 - P0
    edge = []
    if k == 0:
        edge.append('<div id="fin" class="black" style="z-index:9"></div>')
        tl.append('tl.fromTo("#fin",{opacity:1},{opacity:0,duration:1.6,ease:"power1.inOut"},0);')
    if k == len(bounds) - 2:
        edge.append('<div id="fout" class="black" style="z-index:9;opacity:0"></div>')
        tl.append(f'tl.fromTo("#fout",{{opacity:0}},{{opacity:1,duration:1.4,ease:"power1.inOut"}},{dur - 1.5:.3f});')
    kjs = "\n".join(f'<script src="assets/js/{f}"></script>' for f in KJS)
    doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="assets/js/gsap.min.js"></script>
<script src="assets/js/three.min.js"></script>
<style>
{CSS}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1920" data-height="1080">
<canvas id="g3" width="1920" height="1080"></canvas>
<div id="pins"></div>
{chr(10).join(body)}
{chr(10).join(edge)}
</div>
<script>window.LAB = {json.dumps(lab)};</script>
<script src="assets/js/core3d.js"></script>
{kjs}
<script src="assets/js/boot3d.js"></script>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(t for t in tl if t)}
tl.set({{}}, {{}}, {dur:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
    (H / "parts" / f"p{k + 1}.html").write_text(doc, encoding="utf-8")
    print(f"p{k + 1}: {P0:.2f}-{P1:.2f} ({dur:.1f}s) {len(shots)} shots, {len(lab)} 3D")
json.dump(bounds, open(H / "parts" / "bounds.json", "w"))
