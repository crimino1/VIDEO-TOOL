"""Could 100 Men Beat Every Prehistoric Predator? (Unseen Kingdom 2 style, 16:9).
Writes parts/p1..pN.html, sfx.json and usage.json. Voice: assets/audio/vo.wav (make_vo.py inserts the board/card gaps).
Animation: assets/js/pz.js (photo cut-outs puppeted over photo plates, 100 drawn men, counter, size charts, tier board)."""
import json, sys, re, html as html_mod, subprocess
from PIL import Image, ImageFilter, ImageEnhance
from lib import *
import sound

W2 = json.load(open(H / "words2.json"))
END = round(W2["duration"] * 30) / 30
CARDS = json.load(open(H / "cards.json"))
PARTS = [0.0, 146.0, 292.0, 440.0, 590.0, 690.0, END]   # each part <= ~150 s (TEMP space)
PARTS = [round(x * 30) / 30 for x in PARTS]

IMGS = {}   # hidden <img id> -> src, preloaded in every part

# facing of each cut-out as downloaded: 1 = head to the right
NAT = {"vraptor2_1": -1, "vraptor2_2": -1, "direwolf_3": 1, "direwolf_1": 1, "direwolf_2": 1, "kelenken_1": -1, "kelenken_4": -1, "terrorbird_2": 1,
       "smilodon_0": -1, "utah_3": -1, "arctodus_5": 1, "trex_1": 1, "trex_4": -1, "giga_3": 1, "spino_0": -1, "spino_0": 1, "deino_1": -1, "mosa_3": 1,
       "mosa_1": -1, "meg_1": -1, "meg_5": -1, "cavelion_3": -1, "cavelion_5": -1, "mammoth_0": 1, "piano_0": 1, "saltie_2": -1, "gorilla_cut": 1}
NAME = {"vraptor2_1": "Velociraptor", "direwolf_3": "Dire Wolf", "kelenken_1": "Kelenken", "smilodon_0": "Smilodon", "utah_3": "Utahraptor", "arctodus_5": "Short-Faced Bear",
        "trex_4": "T. rex", "giga_3": "Giganotosaurus", "spino_0": "Spinosaurus", "deino_1": "Deinosuchus", "mosa_3": "Mosasaurus", "meg_1": "Megalodon", "titanoboa_0": "Titanoboa"}


def cut_id(name):
    p, w, h = cutout(name)
    IMGS["c_" + name] = p
    return "c_" + name


def plate(name, src=None, at=0.0, blur=1.4, bright=1.0, crop=None):
    """Background plate for the canvas scenes: a Commons photo (src=None) or a frame of a Pexels clip, 2300x1300, slightly soft."""
    out = GEN / f"plate_{name}.jpg"
    if not out.exists():
        if src:
            tmp = GEN / f"_frame_{name}.png"
            subprocess.run([FF, "-v", "error", "-y", "-ss", str(at), "-i", src_path(src), "-frames:v", "1", str(tmp)], check=True)
            im = Image.open(tmp).convert("RGB")
        else:
            im = Image.open(img(name)).convert("RGB")
        if crop:
            Wd, Hd = im.size; im = im.crop((int(crop[0] * Wd), int(crop[1] * Hd), int(crop[2] * Wd), int(crop[3] * Hd)))
        r = max(2300 / im.size[0], 1300 / im.size[1])
        im = im.resize((int(im.size[0] * r) + 1, int(im.size[1] * r) + 1), Image.LANCZOS)
        l, t = (im.size[0] - 2300) // 2, (im.size[1] - 1300) // 2
        im = im.crop((l, t, l + 2300, t + 1300)).filter(ImageFilter.GaussianBlur(blur))
        if bright != 1: im = ImageEnhance.Brightness(im).enhance(bright)
        im.save(out, quality=90)
    IMGS["p_" + name] = f"assets/gen/plate_{name}.jpg"
    return "p_" + name


def B(name, face=1, **kw):
    """A cut-out animal for PZ.beast, turned to face `face` (1 right, -1 left)."""
    d = {"img": cut_id(name), "flip": NAT.get(name, 1) != face}
    for k, v in kw.items():
        if k == "swap": d["swap"] = [[t, cut_id(n)] for t, n in v]
        else: d[k] = v
    return d


# real people (Pexels cut-outs) used by PZ's crowd; ids match PPL in pz.js
for _n in json.load(open(H / "assets" / "people" / "credits.json")):
    IMGS[_n] = cutout(_n)[0]

PHOTO_CREDIT = {}
try:
    for k, c in json.load(open(H / "assets" / "photo" / "credits.json", encoding="utf-8")).items():
        a = html_mod.unescape(re.sub(r"<[^>]*$", "", re.sub(r"<[^>]+>", "", c.get("artist") or ""))); a = html_mod.escape(re.sub(r"\s+", " ", a).strip())
        PHOTO_CREDIT[k] = f"{a[:60]} / Wikimedia Commons" if a else "Wikimedia Commons"
except Exception:
    pass

def V(src, ss=0, speed=1.0, ov=None, **kw):
    def f(a, b):
        video(a, b, "px:" + src, ss, speed, **kw)
        if not ST["skip"]: sound.clip(a, b, src)
        if ov: layer(a, b, ov(a, b))
    return f
def A(ov=None, **opts):
    def f(a, b):
        anim(a, b, "scene", **opts)
        if not ST["skip"]: sound.scene(a, b, opts)
        if ov: layer(a, b, ov(a, b))
    return f
def SZ(name, m, lab, by="len", face=1, ov=None, **kw):
    def f(a, b):
        anim(a, b, "size", img=cut_id(name), m=m, lab=lab, by=by, flip=NAT.get(name, 1) != face, **kw)
        if not ST["skip"]: sound.size(a, b)
        if ov: layer(a, b, ov(a, b))
    return f
def PH(name, ov=None, **kw):
    def f(a, b):
        if not ST["skip"]: sound.photo(a, b)
        layer(a, b, photo(a, b, name, **kw) + credit(PHOTO_CREDIT.get(name, "Wikimedia Commons")) + (ov(a, b) if ov else ""))
    return f
def both(*fs): return lambda a, b: "".join(f(a, b) or "" for f in fs)
def STP(text, t, end=None, y=920, size=72):
    def f(a, b):
        if not ST["skip"]: sound.stamp(s(t))
        return stamp(text, s(t), end, y=y, size=size)
    return f
def FIN(d=0.5): return lambda a, b: fade_in_black(a, d)
def FOUT(d=0.5): return lambda a, b: fade_out_black(b - d, d)
def FX(name, t, vol=1.0):
    def f(a, b):
        sfx(name, t, vol); return ""
    return f

# ---------------- tier board state ----------------
BOARD = []   # [{img, name, row, t (film time), move: [[film t, row]]}]
ROW = {"close": 0, "lose": 1, "bloody": 2, "losses": 3, "easy": 4}
def tile(name, row, t, pre=1.4):
    BOARD.append({"img": cut_id(name if name != "titanoboa" else "titanoboa_0"), "name": NAME.get(name, name.title()), "row": ROW[row], "t": t, "move": [], "pre": pre})
def move(name, row, t):
    for b in BOARD:
        if b["name"] == NAME.get(name, name): b["move"].append([t, ROW[row]])
def BD(z=None, fx=None, fy=None, ov=None):
    def f(a, b):
        tl_ = []
        for u in BOARD:
            if u["t"] - u["pre"] > b: continue
            tl_.append({"img": u["img"], "name": u["name"], "row": u["row"], "t": round(u["t"] - a, 3), "pre": u["pre"],
                        "move": [[round(mt - a, 3), mr] for mt, mr in u["move"] if mt - 0.9 < b]})
        for u in BOARD:
            if 0 <= u["t"] - a < b - a + 0.01 and not ST["skip"]: sound.drop(u["t"])
            for mt, mr in u["move"]:
                if a <= mt < b and not ST["skip"]: sound.move(mt)
        anim(a, b, "board", tiles=tl_, **({"z": z} if z else {}), **({"fx": fx} if fx else {}), **({"fy": fy} if fy else {}))
        if ov: layer(a, b, ov(a, b))
    return f

def CARD(k, bgname):
    """Round title card: big white type over the blurred plate, faded up from black and down to black."""
    c = CARDS[k]
    def f(a, b):
        i, j = nid("h"), nid("h")
        bgp = IMGS.get("p_" + bgname) or plate(bgname)
        tw(f"#{i}", {"opacity": 1, "scale": 1}, a + 0.35, 0.6, {"opacity": 0, "scale": 1.04}, "power2.out")
        size = 150 if len(c["title"]) < 22 else 112
        out = (f'<img class="fill" src="{blurbg_plate(bgname)}" alt="">'
               f'<div id="{i}" class="chap" style="top:{430 - size // 2 - (40 if c["sub"] else 0)}px;font-size:{size}px;padding:0 140px">{c["title"]}</div>')
        if c["sub"]:
            tw(f"#{j}", {"opacity": 1}, a + 1.1, 0.8, {"opacity": 0})
            out += f'<div id="{j}" class="chapsub" style="top:{560 + (60 if size < 150 and len(c["title"]) > 30 else 0)}px">{c["sub"]}</div>'
        if not ST["skip"]: sound.card(a, b)
        return out + fade_in_black(a, 0.45) + fade_out_black(b - 0.45, 0.45)
    return lambda a, b: layer(a, b, f(a, b))

def blurbg_plate(name):
    def mk(out):
        im = Image.open(GEN / f"plate_{name}.jpg").convert("RGB").resize((1920, 1086)).crop((0, 3, 1920, 1083)).filter(ImageFilter.GaussianBlur(26))
        ImageEnhance.Brightness(im).enhance(0.34).save(out, quality=88)
    return gen_img(f"cardbg_{name}.jpg", mk)

exec(open(H / "shots.py", encoding="utf-8").read())
SHOTS = [x for x in SHOTS if x[1] is not None]
_starts = [s(x[0]) for x in SHOTS]
PARTS = [0.0] + [round(max(t for t in _starts if t <= p + 0.01) * 30) / 30 for p in PARTS[1:-1]] + [END]   # parts begin on a shot start
CSS = open(H / "style.css", encoding="utf-8").read()
FAMILY = {"boom": ("boom", 4, 3), "thud": ("thud", 3, 0.2), "swell": ("swell", 6, 0.8), "drone": ("drone", 3, 20)}


def vary(cues):
    last_t, last_v, out = {}, {}, []
    for t, name, vol in cues:
        if name not in FAMILY: out.append([t, name, vol]); continue
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
    ST["skip"] = False
    dur = p1 - p0
    hidden = "".join(f'<img id="{i}" class="hid" src="{p}" alt="">' for i, p in IMGS.items())
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=EB+Garamond&display=block">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/pz.js"></script>
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1920" data-height="1080">
{hidden}
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
    sfx_cues.clear()
    for k in ks: write_part(k)
    if len(ks) == n:
        json.dump(sorted(sound.SND), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        print(len(sound.SND), "sound cues,", sum(1 for c in sound.SND if c[4] == "bed"), "beds")
