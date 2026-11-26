"""Outside Lay EP3: The Most Terrifying Types of Black Holes. Writes parts/p*.html, sfx.json, usage.json, cues.txt.
Voice public/voice.mp3 (873.61 s). 3D: space.js + kinds_ep2.js + kinds_ep3.js (ray-traced black hole). 2D: scenes_ep3.py."""
import json, os, sys
from lib import *
from scenes2d import namecard, bignum, listcard, lenses
from scenes_ep3 import *

END = 873.61
CSS = open(H / "style.css", encoding="utf-8").read()


def I(name, w_=900, h_=900, crop=None):
    try: return fitted(name, w_, h_, crop)
    except AssertionError:
        print("MISSING image", name)
        return gen_img("missing.jpg", lambda out: Image.new("RGB", (64, 64), (14, 20, 32)).save(out))


def IMGP(name):
    """Raw path for a 3D texture from assets/img (falls back to a dark texture)."""
    try: return "assets/img/" + img(name).name
    except AssertionError:
        print("MISSING texture", name); return "assets/tex/2k_stars.jpg"


# ---------------- shot builders ----------------
def G(kind, ov=None, **o):
    def f(a, b, **_):
        G3(a, b, kind, **o)
        if ov: layer(a, b, ov(a, b), fin=0)
    f.k = "3d"; return f


def N(fn, *args, **kw):
    def f(a, b):
        pid = nid("push")   # slow camera push so diagrams never sit still
        tw(f"#{pid}", {"scale": 1.035}, a, b - a, {"scale": 1.0}, "none")
        return f'<div id="{pid}" class="scene" style="transform-origin:50% 55%">' + fn(a, b, *args, **kw) + '</div>'
    f.k = "2d"; return f


def PH(name, ov=None, **kw):
    def f(a, b):
        try: h = photo_html(a, b, name, **kw)
        except AssertionError:
            print("MISSING photo", name); h = navy(a, b)
        return h + ('<div class="shade"></div>' + ov(a, b) if ov else "")
    f.k = "2d"; return f


def VD(src, ss=0, ov=None, **kw):
    def f(a, b): return ("vid", src, ss, kw, ov)
    f.k = "vid"; return f


def OV(*fs): return lambda a, b: "".join(f(a, b) for f in fs)
def ST_(text, t, end=None, y=900, white=False, size=72): return lambda a, b: stmt(text, t, end, y, white, size)
def LB(text, t, x, y, end=None, white=False, size=22, anchor="left"): return lambda a, b: lab(text, t, x, y, end, white, size, anchor)
def BX(text, t, x, y, end=None, kind="", anchor="left"): return lambda a, b: box(text, t, x, y, end, kind, anchor)
def NM(n0, n1, unit, t, x=None, y=880, count=1.2, end=None, dec=0, prefix="", suffix="", size=96): return lambda a, b: num(n0, n1, unit, t, x, y, count, end, dec, prefix, suffix, size)
def HD(text, t=None): return lambda a, b: hdr(text, t if t is not None else a + 0.1)
def LN(name, t, x, y, r, end=None): return lambda a, b: lens(t, x, y, r, I(name), end)
def FX(name, t, vol=1.0):
    def f(a, b): sfx(name, t, vol); return ""
    return f


t = lambda word, after, **kw: w(word, after, **kw)
HERO = dict(diskIn=3.0, diskOut=14)
BIG = dict(diskIn=3.0, diskOut=18)
HOT = dict(diskIn=3.0, diskOut=9, temp=1.4, tint=[0.86, 0.93, 1.1])
FADEIN = lambda a, b: (tw("#fadein0", {"opacity": 0}, 0.0, 2.2, {"opacity": 1}, "power1.inOut") or "") + '<div id="fadein0" class="black"></div>'


def RANK(n, word, name):
    """Cinematic title card: small spaced caps + serif name, fading up from black."""
    def f(a, b):
        i1, i2, i3 = nid("rk"), nid("rk"), nid("rk")
        tw(f"#{i1}", {"opacity": 1}, a + 0.3, 1.0, {"opacity": 0}, "power1.inOut")
        tw(f"#{i2}", {"opacity": 1}, a + 0.7, 1.2, {"opacity": 0}, "power1.inOut")
        tw(f"#{i3}", {"scaleX": 1}, a + 0.5, 1.4, {"scaleX": 0}, "power2.inOut")
        out = (f'<div class="black"></div><div class="tcard">'
               f'<div id="{i1}" class="tk" style="opacity:0">NUMBER {word}</div>'
               f'<div id="{i3}" class="trule" style="transform:scaleX(0)"></div>'
               f'<div id="{i2}" class="tn" style="opacity:0">{name}</div></div>')
        tw(f"#{i1}", {"opacity": 0}, b - 0.6, 0.5); tw(f"#{i2}", {"opacity": 0}, b - 0.6, 0.5)
        sfx("boom", a + 0.2, 0.45)
        return out
    f.k = "2d"; f.dip = True; return f


def TITLE(text, t0, t1, x=150, y=760, size=74):
    def f(a, b):
        i = nid("ti")
        tw(f"#{i}", {"opacity": 1}, t0, 1.6, {"opacity": 0}, "power1.inOut")
        if t1: tw(f"#{i}", {"opacity": 0}, s(t1) - 1.0, 1.0, None, "power1.inOut")
        return f'<div id="{i}" class="title" style="left:{x}px;top:{y}px;font-size:{size}px;opacity:0">{text}</div>'
    return f


def ASTRO(t_stretch, b_):
    """NASA astronaut photo cut-out floating in front of the rendered black hole, stretched by tides."""
    def f(a, b):
        i, j = nid("as"), nid("as")
        tw(f"#{j}", {"x": -40, "y": 30, "rotation": 6}, a, s(b) - a, {"x": 0, "y": 0, "rotation": 0}, "none")
        tw(f"#{i}", {"scaleY": 1.75, "scaleX": 0.6}, t_stretch, max(1.0, s(b) - s(t_stretch)), {"scaleY": 1.0, "scaleX": 1.0}, "power1.in")
        return (f'<div id="{j}" style="position:absolute;left:1180px;top:300px;width:420px;height:440px">'
                f'<img id="{i}" src="assets/img/astronaut_cut.png" style="width:420px;height:440px;object-fit:contain;transform-origin:50% 55%"></div>')
    return f


SHOTS = [
    # ================= HOOK =================
    ("0:00.00", G("bh", bhK=[[0, 0]], starDir=[0.02, 0.01, -1], starKK=[[0, 3], [9.0, 30], [t("faded", 11.8) - 11.0, 30], [t("faded", 11.8) - 8.0, 4]],
                  dist=24, el=2, az0=-1.5, az1=1.5, fovK=[[0, 36], [20, 27]], ov=OV(FADEIN, FX("boom", 0.4, 0.4)))),
    (t("magnifying", 11.8) - 0.3, VD("px_magnify_0", 0)),
    ("0:23.70", G("bh", disk=0, starDir=[0.0, 0.0, -1], star=34, dist=24, el=2, az0=-5, az1=5, fovK=[[0, 36], [11.7, 30]], shiftX=280, rollK=[[0, 0], [11.7, 3]])),
    ("0:35.44", G("bh", disk=0, glow=0, starDir=[0.0, 0.0, -1], starKK=[[0, 34], [2.5, 0]], dist0=24, dist1=18, el=3, az0=5, az1=9, fov=34, shiftX=-260)),
    ("0:40.86", G("bh", disk=0, dist0=30, dist1=25, el=4, az0=20, az1=70, fov=40, roll=-5, skyRot=0.12)),
    ("0:51.57", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, dist0=170, dist1=135, el0=62, el1=48, az0=0, az1=18, sx=-180)),
    ("0:55.54", G("bh", dist0=36, dist1=26, el0=3, el1=6, az0=-14, az1=4, shiftX=310, **HERO,
                  ov=TITLE("The Most Terrifying<br>Types of Black Holes", 60.4, "1:06.26", 150, 620, 86))),
    ("1:06.26", G("bh", dist0=82, dist1=62, el0=16, el1=9, az0=30, az1=58, jet=0.8, shiftX=-220, **HERO)),
    ("1:19.82", G("bh", dist=34, el=5, az0=0, az1=8, fovK=[[0, 18], [3.8, 14]], **HERO)),
    # ================= #8 SILENT =================
    ("1:23.62", RANK(8, "EIGHT", "The Silent One")),
    (t("picture", 86.5), G("bh", dist0=33, dist1=26, el=4, az0=-22, az1=-8, shiftX=290, roll=-5, glow=0, **HERO,
                           diskK=[[0, 1], [t("aren't", 96.3) - t("picture", 86.5), 1], [t("quiet", 99.4) - t("picture", 86.5) + 1.2, 0]])),
    ("1:46.82", G("bh", disk=0, distK=[[0, 28], [5.2, 25]], elK=[[0, 10], [5.2, 18]], az0=0, az1=12, shiftX=-230, comp=dict(a=7.5, r=0.9, sp=15, ph=0))),
    ("1:52.08", PH("gaia_spacecraft", zoom=(1.0, 1.1), origin="70% 65%")),
    ("2:02.22", G("bh", disk=0, dist=36, el=34, az0=0, az1=16, comp=dict(a=8, r=0.95, sp=30, ph=-40))),
    ("2:13.88", G("bh", disk=0, dist=42, el=12, az0=-10, az1=4, fov=26, shiftX=240, comp=dict(a=8, r=0.95, sp=12, ph=-30))),
    ("2:23.06", PH("gaia_bh3_art", zoom=(1.0, 1.1), origin="35% 50%")),
    ("2:35.66", G("bh", disk=0, dist=32, el=5, az0=40, az1=52, fov=18, look0=[2.6, 0, 0], look1=[2.0, 0.2, 0])),
    ("2:46.16", VD("px_nightsky_0", 0)),
    # ================= #7 SHREDDER =================
    ("2:58.08", RANK(7, "SEVEN", "The Shredder")),
    ("3:00.28", G("bh", dist0=22, dist1=17, el=3, az0=10, az1=24, shiftX=300, rollK=[[0, 0], [6.9, 6]], **HOT)),
    ("3:07.22", G("bh", dist0=30, dist1=26, el=4, az0=-14, az1=-4, shiftX=-330, **HOT, ov=ASTRO(t("feet", 205.1), "3:29.48"))),
    ("3:29.48", VD("px_toothpaste_0", 0)),
    ("3:36.68", G("bh", distK=[[0, 24], [13.1, 16]], el=4, az0=0, az1=25, rollK=[[0, 0], [13.1, -8]], ease="in", **HOT)),
    ("3:49.80", G("bh", dist=22, el=3, az0=10, az1=16, fov=20, look0=[3.4, 0, 0], look1=[3.0, 0, 0], **HOT)),
    ("3:57.24", VD("nasa_tde_a", 3)),
    ("4:07.14", PH("tde_art", zoom=(1.0, 1.1), origin="40% 60%")),
    ("4:16.38", G("bh", distK=[[0, 46], [15.5, 20]], el=5, az0=-6, az1=6, rollK=[[0, 0], [15.5, 4]], ease="inout", **BIG)),
    # ================= #6 WANDERER =================
    ("4:31.90", RANK(6, "SIX", "The Wanderer")),
    (t("Remember", 273.0), G("bh", disk=0, starDir=[0.01, 0.0, -1], star=34, dist=24, el=2, az0=4, az1=-4, fov=32, shiftX=-260, roll=-3)),
    ("4:45.30", PH("crab_nebula", zoom=(1.0, 1.12), origin="50% 45%")),
    (t("kick", 290.5) - 0.8, G("bh", disk=0, dist=36, el=3, az0=0, az1=8, fov=44, skyRotSp=0.016, roll=-7)),
    ("4:58.82", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, dist0=120, dist1=150, el0=28, el1=40, az0=30, az1=52, sx=200)),
    ("5:10.54", PH("microlens_hubble", crop=(0.0, 0.14, 1.0, 0.58), zoom=(1.0, 1.14), origin="55% 70%")),
    ("5:15.18", G("bh", disk=0, starDir=[0.03, 0.02, -1], star=30, dist=26, el=6, az0=-3, az1=3, fov=28, shiftX=220)),
    ("5:27.84", VD("nasa_bh_bare_orbit", 2)),
    ("5:38.26", G("earth", dist0=3.1, dist1=2.6, el=6, az0=150, az1=162, sun=[175, 5], sx=-260)),
    # ================= #5 PRIMORDIAL =================
    ("5:54.96", RANK(5, "FIVE", "The Ghost from the Big Bang")),
    ("5:58.58", PH("cmb_planck", mode="card", bg="black", maxw=1500, maxh=700, zoom=(1.0, 1.06))),
    ("6:12.88", PH("hawking_b", mode="card", bg="black", maxh=760, zoom=(1.0, 1.05))),
    ("6:25.64", G("bh", disk=0, dist0=18, dist1=15, el=3, az0=0, az1=12, fov=26, shiftX=260, glow=0.6)),
    ("6:31.66", VD("px_mountain_0", 0)),
    ("6:35.72", VD("px_palm_0", 0)),
    ("6:40.02", PH("rogue_bh_art", zoom=(1.0, 1.12), origin="50% 55%")),
    ("6:52.12", G("bh", disk=0, starDir=[0.36, 0.06, -1], star=16, dist0=17, dist1=14, el=2, az0=-6, az1=6, fov=34, shiftX=-200)),
    ("7:09.46", VD("px_bowling_0", 0)),
    ("7:17.38", G("bh", disk=0, dist0=14, dist1=11, el=2, az0=20, az1=30, shiftX=-280)),
    # ================= #4 SNIPER =================
    ("7:26.18", RANK(4, "FOUR", "The Sniper")),
    ("7:28.48", G("bh", dist0=46, dist1=40, el=12, az0=-30, az1=-14, shiftX=-260, diskOut=11,
                  jetK=[[0, 0], [t("blasted", 452.7) - 448.48, 0], [t("blasted", 452.7) - 448.48 + 2.0, 1.2]])),
    ("7:41.40", G("bh", dist0=62, dist1=70, el0=10, el1=28, az0=-14, az1=10, fov=26, roll0=0, roll1=6, jet=1.2, diskOut=11)),
    ("7:47.52", G("bh", distK=[[0, 70], [10.7, 52]], elK=[[0, 28], [3.0, 30], [10.7, 66]], az=10, rollK=[[0, 0], [10.7, 10]], jet=1.3, diskOut=11)),
    ("7:58.24", VD("px_ice_0", 0)),
    (t("caught", 478.2), VD("nasa_icecube_detect", 0)),
    ("8:11.20", VD("nasa_blazar_jet", 0)),
    ("8:31.42", G("earth", dist0=3.4, dist1=3.0, el=8, az0=10, az1=20, sun=[-70, 6], sx=240)),
    ("8:43.12", PH("milkyway_center", zoom=(1.0, 1.12), origin="45% 50%")),
    # ================= #3 RUNAWAY =================
    ("8:52.22", RANK(3, "THREE", "The Runaway")),
    (t("Almost", 533.4), G("bh", dist0=42, dist1=34, el=4, az0=60, az1=72, fov=48, shiftX=300, **BIG)),
    ("9:04.12", PH("runaway_streak_b", zoom=(1.0, 1.14), origin="78% 45%")),
    ("9:21.52", PH("runaway_art", zoom=(1.0, 1.1), origin="30% 70%")),
    (t("Two", 572.8), G("bh", disk=0, dist=40, el=4, az0=0, az1=10, fov=45, skyRotSp=0.014, roll=-8)),
    ("9:52.40", VD("nasa_runaway_streak", 0)),
    ("10:00.74", G("bh", disk=0, dist=40, el=5, az0=80, az1=92, fov=20, look0=[2.4, 0, 0], look1=[1.9, 0.3, 0])),
    # ================= #2 GLUTTON =================
    ("10:17.12", RANK(2, "TWO", "The Glutton")),
    (t("2024", 618.3) - 0.4, PH("quasar_j0529_art", zoom=(1.0, 1.12), origin="55% 50%")),
    ("10:39.72", G("bh", dist0=38, dist1=32, el=10, az0=-20, az1=-6, shiftX=-300, temp=1.9, diskOut=20, jet=0.5, exposure=1.0)),
    ("10:45.90", G("bh", dist0=74, dist1=62, el=14, az0=-6, az1=6, temp=1.9, diskOut=20, jet=0.5, exposure=1.0)),
    (t("blazes", 650.5) - 0.2, G("bh", dist0=60, dist1=52, el0=12, el1=5, az0=6, az1=16, roll=4, temp=1.9, diskOut=20, jet=0.5, exposure=1.0, shiftX=220)),
    ("11:06.92", G("bh", distK=[[0, 30], [15.3, 14]], el=5, az0=20, az1=34, shiftX0=200, shiftX1=0, **HERO)),
    # ================= #1 INSIDE =================
    ("11:28.32", RANK(1, "ONE", "The One We Might Be Inside")),
    ("11:31.48", G("bh", disk=0, dist=26, el=4, az0=0, az1=8, fov=24, look0=[1.8, 0, 0], look1=[1.4, 0.1, 0])),
    ("11:39.44", G("bh", disk=0, distK=[[0, 14], [13.2, 2.7]], el=3, az0=0, az1=12, rollK=[[0, 0], [13.2, 10]], ease="in")),
    ("11:52.70", G("observable", cmb=IMGP("cmb_sphere"), dist0=270, dist1=235, el=14, sx=0)),
    ("12:06.70", G("observable", cmb=IMGP("cmb_sphere"), dist0=235, dist1=330, el0=14, el1=22, az0=20, az1=40)),
    ("12:29.76", G("bh", dist0=30, dist1=26, el=6, az0=-20, az1=-5, shiftX=280, **HERO)),
    ("12:35.76", G("bh", distK=[[0, 24], [8.82, 2.6]], el=6, az=0, rollK=[[0, 0], [8.82, 15]], ease="in", **HERO)),
    ("12:44.58", G("observable", cmb=IMGP("cmb_sphere"), distK=[[0, 4], [14.7, 240]], el=10, cmbK=[[0, 0], [4, 0], [9, 1]])),
    ("12:59.32", PH("jades_field", zoom=(1.0, 1.16), origin="50% 50%")),
    ("13:17.80", G("bh", dist0=48, dist1=42, el=40, az0=0, az1=60, shiftX=-250, spin=1.3, speed=2.5, **HERO)),
    ("13:29.20", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, dist0=150, dist1=125, el=55, az0=0, az1=30, spin=4)),
    ("13:40.62", G("bh", distK=[[0, 26], [18.4, 2.2]], el=5, az0=-10, az1=10, rollK=[[0, 0], [18.4, -12]], ease="in", **HERO)),
    ("13:59.02", G("bh", dist0=34, dist1=28, el=8, az0=-30, az1=-10, shiftX=300, roll=-4, **HERO)),
    ("14:09.42", G("bh", disk=0, dist0=20, dist1=16, el=3, az0=0, az1=8, fovK=[[0, 30], [6.3, 24]])),
    ("14:15.74", PH("eht_sgra", mode="card", bg="black", maxh=720, zoom=(1.0, 1.06))),
    ("14:27.14", G("bh", dist0=60, dist1=54, el=7, az0=-10, az1=0, shiftX=300, **HERO, ov=TITLE("Outside Lay", s("14:29.26"), None, 150, 640, 96))),
]
HUD = []


def is_layer(f): return getattr(f, "k", "2d") != "3d"


def write_part(k, parts):
    p0, p1 = parts[k], parts[k + 1]
    html.clear(); tl.clear(); sps.clear()
    ST.update(off=p0, n=10)
    for i, (st, fn) in enumerate(SHOTS):
        a = s(st); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        ST["skip"] = not (p0 - 0.05 <= a < p1 - 0.05)
        if abs(a - p0) < 0.05: a = p0
        nxt = SHOTS[i + 1][1] if i + 1 < len(SHOTS) else None
        prv = SHOTS[i - 1][1] if i else None
        last_in_part = i + 1 >= len(SHOTS) or s(SHOTS[i + 1][0]) >= p1 - 0.05
        if nxt is not None and getattr(nxt, "dip", False) and not ST["skip"]:   # fade to black into a rank card
            did = nid("dip"); tw(f"#{did}", {"opacity": 1}, b - 0.7, 0.7, {"opacity": 0}, "power1.in")
            layer(b - 0.7, b, f'<div id="{did}" class="black" style="opacity:0"></div>', fin=0, z=9400)
        if fn.k == "3d":
            fn(a, b); continue
        bx, fout = (min(b, p1) if last_in_part else b), 0.0
        fin = 0.0
        if fn.k == "vid" and not os.path.exists(src_path(fn(a, b)[1])):
            _, src, ss, kw, ov = fn(a, b); print("MISSING clip", src)
            layer(a, bx, navy(a, bx) + (ov(a, bx) if ov else ""), fin=fin, fout=fout)
        elif fn.k == "vid":
            _, src, ss, kw, ov = fn(a, bx)
            ST["n"] += 1
            if not ST["skip"]:
                wid, v = nid("w"), nid("v")
                clip = trim(src, ss, bx - a, kw.get("speed", 1.0), kw.get("crop"), kw.get("grade", ""))
                html.append(f'<div id="{wid}" class="vw" style="left:0;top:0;width:1920px;height:1080px;z-index:{ST["n"]}"><video id="{v}" class="clip fit" src="{clip}" muted playsinline '
                            f'data-start="{T(a)}" data-duration="{bx - a:.3f}" data-track-index="1"></video></div>')
                z = kw.get("zoom", (1.0, 1.06)); tw(f"#{v}", {"scale": z[1]}, a, bx - a, {"scale": z[0]}, "none")
                if fin: tw(f"#{wid}", {"opacity": 1}, a, fin, {"opacity": 0}, "power1.inOut")
                if fout: tw(f"#{wid}", {"opacity": 0}, bx - fout, fout, None, "power1.inOut")
            if ov: layer(a, bx, '<div class="shade"></div>' + ov(a, bx), fin=fin, fout=fout)
        else:
            layer(a, bx, fn(a, bx), fin=fin, fout=fout)
    # scale readout on top of everything
    for st, en, txt in HUD:
        a, b = max(s(st), p0), min(s(en), p1)
        ST["skip"] = not (a < b - 0.3)
        if not ST["skip"]: layer(a, b, lab(txt, a + 0.2, 1856, 60, b, True, 16, "right"), fin=0, z=9000)
    # cinematic finish: 2.2:1 letterbox, soft vignette, fine moving film grain (whole part)
    ST["skip"] = False
    dur = p1 - p0; gid = nid("grain"); steps = int(dur * 24)
    tw(f"#{gid}", {"backgroundPositionX": steps * 37, "backgroundPositionY": steps * 53}, p0, dur, {"backgroundPositionX": 0, "backgroundPositionY": 0}, f"steps({steps})")
    layer(p0, p1, f'<div class="vign"></div><div id="{gid}" class="grain"></div><div class="lbx top"></div><div class="lbx bot"></div>', fin=0, z=9800)
    # part seams: dip to black over the last / first 0.35 s
    if k + 1 < len(parts) - 1: layer(p1 - 0.35, p1, (tw("#seamout", {"opacity": 1}, p1 - 0.35, 0.35, {"opacity": 0}, "power1.in") or "") + '<div id="seamout" class="black" style="opacity:0"></div>', fin=0, z=9500)
    if k: layer(p0, p0 + 0.4, (tw("#seamin", {"opacity": 0}, p0, 0.4, {"opacity": 1}, "power1.out") or "") + '<div id="seamin" class="black"></div>', fin=0, z=9500)
    dur = p1 - p0
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/three.min.js"></script>
{"<script src='assets/js/voyager_mesh.js'></script>" if (H / "assets/js/voyager_mesh.js").exists() else ""}
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1920" data-height="1080">
<canvas id="g3" width="1920" height="1080" style="z-index:1"></canvas>
{chr(10).join(html)}
</div>
<script>
window.SPS = {json.dumps(sps)};
</script>
<script src="assets/js/space.js"></script>
<script src="assets/js/kinds_ep2.js"></script>
<script src="assets/js/kinds_ep3.js"></script>
<script>SP_start();</script>
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
    print(f"p{k + 1}.html  {p0:.2f}-{p1:.2f}  {len(html)} layers, {len(tl)} tweens, {len(sps)} 3D shots")


PARTS = [0.0, s("2:58.08"), s("5:54.96"), s("8:52.22"), s("11:28.32"), END]

if __name__ == "__main__":
    for i in range(1, len(SHOTS)):
        assert s(SHOTS[i][0]) > s(SHOTS[i - 1][0]), f"shot order {SHOTS[i - 1][0]} -> {SHOTS[i][0]}"
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(len(PARTS) - 1)
    sfx_cues.clear()
    for k in ks: write_part(k, PARTS)
    if len(ks) == len(PARTS) - 1:
        json.dump(sorted(sfx_cues), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        open(H / "cues.txt", "w", encoding="utf-8").write("\n".join(f"{q!r:16} after {a:7.2f} -> {m!r:16} {tt:7.2f}" for q, a, m, tt in CUES))
        print(len(sfx_cues), "sound cues;", len(CUES), "word cues in cues.txt")
