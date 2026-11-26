"""Why Orcas Never Hunt Alone (Unseen Kingdom). Was: Every Deep Sea Predator Explained In 9 Minutes (Unseen Kingdom). Writes parts/p1..p4.html, sfx.json and usage.json.
Voice: assets/vo.wav (553.26 s). Animals in the animation are real photo cut-outs (assets/cut) moved on canvas by assets/js/deep.js + sc.js."""
import json, sys, re, glob
from lib import *
from scenes_pred import *
from scenes_orca import *

END = 904.24
PARTS = [round(x * 30) / 30 for x in (0.0, s("3:48.12"), s("7:48.88"), s("11:10.60"), END)]
ROT = {}


def pick(src):
    if not src.startswith("px_") or re.search(r"_\d+$", src): return src
    opts = sorted(glob.glob(str(H / "assets" / "raw" / (src + "_*.mp4"))))
    if not opts: return src + "_0"
    k = ROT.get(src, 0); ROT[src] = k + 1
    return Path(opts[k % len(opts)]).stem


CREDIT = {"bremer": "Whale Watch Western Australia", "bremer2": "Whale Watch Western Australia", "starboard": "Footage: see description", "portstar": "Good Morning South Africa",
          "wavewash": "Footage: see description", "iceseal": "Laag Ni Ivan", "abc_orca": "ABC News", "beach": "Footage: see description", "beach2": "Anthropocene.Photography",
          "monterey": "Monterey Bay Whale Watch", "seaswap": "Footage: see description", "car_devos": "Jacques de Vos", "car_slap": "Jacques de Vos", "car_lfw": "Learning From Whales",
          "car_lfw2": "Learning From Whales", "car_wpe": "Waterproof Expeditions", "car_under": "Pierre Robert De Latour", "beach_klipp": "Bill & Linda Klipp", "beach_klipp2": "Bill & Linda Klipp",
          "beach_intriper": "Intriper", "gray_mbww": "Monterey Bay Whale Watch", "gray_dww": "Discovery Whale Watch", "gray_ccp": "CCPhotographs", "gray_princess": "Princess Monterey",
          "res_jpod": "Orca Behavior Institute", "res_cwr": "Center for Whale Research / Orca Network", "res_j16": "Western Prince Whale Watching", "res_super": "Mark Malleson",
          "luna_suz": "Suzanne Chisholm", "luna_museum": "The Whale Museum", "luna_dog": "Curious Bo", "luna_fender": "Curious Bo", "luna_canoe": "Baby Wild Films",
          "eden_1975": "Eden Killer Whale Museum", "eden_skel": "Kids' Perspective Family Travel", "eden_dibby": "DibbyTravels", "tr_punt": "Roll.Focus.", "tr_share": "Andrew Harpster",
          "tr_seals": "Meg McDonald", "tr_porpoise": "Alaska Whale and Drone Tours", "blue_strike": "Whale Watch Western Australia", "blue_escape": "Whale Watch Western Australia",
          "blue_canyon": "Whale Watch Western Australia", "blue_mbww": "Monterey Bay Whale Watch", "breach_mbww": "Monterey Bay Whale Watch"}
CREDIT = {k: (v if v.startswith("Footage") else "Footage: " + v) for k, v in CREDIT.items()}


def V(src, ss=0, speed=1.0, ov=None, **kw):
    def f(a, b):
        s_ = pick(src)
        video(a, b, s_, ss, speed, **kw)
        if s_.startswith("yt:") and s_[3:] in CREDIT: layer(a, b, credit(CREDIT[s_[3:]]))
        if ov: layer(a, b, ov(a, b))
    return f


def A(name, ov=None, **opts):
    def f(a, b):
        anim(a, b, name, **opts)
        if not ST.get("prevA"): sfx("water_whoosh", a - 0.4, 0.3)
        ST["curA"] = True
        if ov: layer(a, b, ov(a, b))
    return f


def S(fn, *args, **kw): return lambda a, b: layer(a, b, fn(a, b, *args, **kw))
def PH(name, ov=None, **kw): return lambda a, b: layer(a, b, photo(a, b, name, **kw) + (ov(a, b) if ov else ""))
def both(*fs): return lambda a, b: "".join(f(a, b) or "" for f in fs)
def ST_(text, t, end=None, **kw): return lambda a, b: stamp(text, t, end, **kw)
def NM(text, t):        # the animal's name, lower centre
    def f(a, b):
        sfx("deep_boom", s(t) - 0.05, 0.35); return stamp(text, t, min(b, s(t) + 3.4), y=850, size=120)
    return f
def LB(text, t, x, y, **kw): return lambda a, b: label(text, t, x, y, **kw)
def FX(name, t, vol=1.0):
    def f(a, b):
        sfx(name, t, vol); return ""
    return f
def DC(big, sub=None, t_sub=None):    # depth card over a dive
    def f(a, b):
        sfx("deep_boom", a + 0.15, 0.8); sfx("drone_swell", a - 0.3, 0.5)
        return depth_card(a, b, big, sub, t_sub)
    return f
def TT(text, t, end=None, y=380, size=150, sub=None):
    return lambda a, b: title(text, t, end or b - 0.1, y=y, size=size, sub=sub, sub_t=s(t) + 1.0)



exec(open(H / "shots.py", encoding="utf-8").read())
SHOTS = [x for x in SHOTS if x[1] is not None]
CSS = open(H / "style.css", encoding="utf-8").read()
IMGS = {f"img_{n}": n for n in ["orca_a", "orca_b", "orca_c", "seal_floe", "salmon2", "herring", "harbor_seal", "lantern"]}
IMGS.update({"img_gray": "il_gray", "img_blue": "il_blue"})
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
    ST.update(off=p0, n=10); ROT.clear()
    for i, (st, fn) in enumerate(SHOTS):
        a = s(st); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        ST["skip"] = not (p0 - 0.05 <= a < p1 - 0.05)
        if abs(a - p0) < 0.05: a = p0
        ST["curA"] = False
        fn(a, b)
        ST["prevA"] = ST["curA"]
    ST["skip"] = False
    dur = p1 - p0
    hidden = "".join(f'<img id="{i}" class="hid" src="assets/cut/{f}.png" alt="">' for i, f in IMGS.items())
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/ocean.js"></script><script src="assets/js/deep.js"></script><script src="assets/js/orca.js"></script>
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
