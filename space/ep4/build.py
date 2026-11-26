"""Outside Lay EP4: What If You Traveled to a Black Hole and Came Back to Earth? Writes parts/p*.html, sfx.json, usage.json, cues.txt.
Voice public/voice.mp3 (740.09 s). STYLE v3: cinematic documentary, no captions, real footage of real people, ray-traced 3D, hard cuts."""
import json, os, sys
from lib import *

END = 740.09
CSS = open(H / "style.css", encoding="utf-8").read()
PXG = "eq=contrast=1.05:saturation=0.86:gamma=0.98"   # one gentle grade so stock from many cameras sits together
RED = "colorchannelmixer=rr=0.85:rg=0.3:rb=0.1:gr=0.1:gg=0.12:gb=0.04:br=0.06:bg=0.06:bb=0.07,eq=brightness=-0.06"
ORI = (0.0, 0.2, 0.75, 0.95)     # Orion clip crop: ship only, no Earth in the corner
ORC = (0.0, 0.25, 0.75, 1.0)


def IMGP(name):
    try: return "assets/img/" + img(name).name
    except AssertionError:
        print("MISSING texture", name); return "assets/tex/2k_stars.jpg"


def add_vid(a, b, src, ss=0.0, crop=None, grade="", speed=1.0, blend="screen", op=1.0, fade=None, x=0, y=0, scale=1.0, drift=(0, 0)):
    """A clip composited over the 3D canvas (black = transparent with screen blend), e.g. NASA's Orion over the black hole."""
    ST["n"] += 1
    if ST["skip"]: return
    a, b = s(a), s(b)
    wid, v = nid("ow"), nid("ov")
    clip = trim(src, ss, b - a, speed, crop, grade)
    html.append(f'<div id="{wid}" class="vw" style="left:0;top:0;width:1920px;height:1080px;z-index:{ST["n"]};mix-blend-mode:{blend};opacity:{op}">'
                f'<video id="{v}" class="clip fit" src="{clip}" muted playsinline data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="3" '
                f'style="transform:translate({x}px,{y}px) scale({scale})"></video></div>')
    if drift != (0, 0): tw(f"#{v}", {"x": x + drift[0], "y": y + drift[1]}, a, b - a, {"x": x, "y": y, "scale": scale}, "none")
    if fade: tw(f"#{wid}", {"opacity": 0}, s(fade[0]), fade[1], None, "power1.in")


# ---------------- shot builders ----------------
def G(kind, ov=None, vid=None, vid2=None, **o):
    def f(a, b, **_):
        G3(a, b, kind, **o)
        for vv in (vid, vid2):
            if vv: add_vid(a, b, **vv)
        if ov: layer(a, b, ov(a, b), fin=0)
    f.k = "3d"; return f


def PH(name, ov=None, **kw):
    def f(a, b):
        try: h = photo_html(a, b, name, **kw)
        except AssertionError:
            print("MISSING photo", name); h = '<div class="black"></div>'
        return h + (ov(a, b) if ov else "")
    f.k = "2d"; return f


def VD(src, ss=0, ov=None, **kw):
    if src.startswith("px_"): kw.setdefault("grade", PXG)
    def f(a, b): return ("vid", src, ss, kw, ov)
    f.k = "vid"; return f


def OV(*fs): return lambda a, b: "".join(f(a, b) for f in fs)
def FX(name, t, vol=1.0):
    def f(a, b): sfx(name, t, vol); return ""
    return f


t = lambda word, after, **kw: w(word, after, **kw)
HERO = dict(diskIn=3.0, diskOut=14)
BIG = dict(diskIn=3.0, diskOut=18)
FADEIN = lambda a, b: (tw("#fadein0", {"opacity": 0}, 0.0, 2.0, {"opacity": 1}, "power1.inOut") or "") + '<div id="fadein0" class="black"></div>'
SHIP = dict(src="nasa_orion_earth", ss=2, crop=ORI, scale=0.72, x=-380, y=60)


def CARD(kicker, name):
    """Chapter card: small spaced caps + thin rule + serif name on black."""
    def f(a, b):
        i1, i2, i3 = nid("rk"), nid("rk"), nid("rk")
        tw(f"#{i1}", {"opacity": 1}, a + 0.25, 0.9, {"opacity": 0}, "power1.inOut")
        tw(f"#{i2}", {"opacity": 1}, a + 0.55, 1.0, {"opacity": 0}, "power1.inOut")
        tw(f"#{i3}", {"scaleX": 1}, a + 0.4, 1.2, {"scaleX": 0}, "power2.inOut")
        tw(f"#{i1}", {"opacity": 0}, b - 0.5, 0.45); tw(f"#{i2}", {"opacity": 0}, b - 0.5, 0.45); tw(f"#{i3}", {"opacity": 0}, b - 0.5, 0.45)
        sfx("boom", a + 0.1, 0.4)
        return (f'<div class="black"></div><div class="tcard">'
                f'<div id="{i1}" class="tk" style="opacity:0">{kicker}</div>'
                f'<div id="{i3}" class="trule" style="transform:scaleX(0)"></div>'
                f'<div id="{i2}" class="tn" style="opacity:0">{name}</div></div>')
    f.k = "2d"; f.dip = True; return f


def TITLE(text, t0, t1, x=150, y=760, size=74):
    def f(a, b):
        i = nid("ti")
        tw(f"#{i}", {"opacity": 1}, t0, 1.6, {"opacity": 0}, "power1.inOut")
        if t1: tw(f"#{i}", {"opacity": 0}, s(t1) - 1.0, 1.0, None, "power1.inOut")
        return f'<div id="{i}" class="title" style="left:{x}px;top:{y}px;font-size:{size}px;opacity:0">{text}</div>'
    return f


BH_ON = t("black", 27.5)
SHOTS = [
    # ================= COLD OPEN: the goodbye, the trip, the return =================
    ("0:00.00", VD("nasa_launchpad_n", 6, ov=FADEIN, zoom=(1.0, 1.08))),
    (t("saying", 1.0), VD("px_friends_hug_0", 0, zoom=(1.0, 1.05))),
    ("0:05.76", VD("px_friends_hug_1", 0, zoom=(1.02, 1.08))),
    ("0:09.86", VD("nasa_engines", 1.0, crop=(0.0, 0.28, 0.72, 1.0), zoom=(1.0, 1.04))),
    (t("ignite", 10.0, end=True), VD("nasa_ignite", 3.6, zoom=(1.0, 1.05))),
    ("0:11.58", VD("nasa_earth_window", 3, zoom=(1.0, 1.06))),
    ("0:13.48", G("earth", distK=[[0, 1.9], [2.2, 6.5], [4.5, 70]], el=6, az0=40, az1=60, sun=[-55, 8], fov=30)),
    ("0:17.98", VD("nasa_orion_earth", 0, crop=ORI, zoom=(1.0, 1.05))),
    ("0:19.94", G("bh", bhK=[[0, 0]], disk=0, starDir=[0.03, 0.01, -1], starKK=[[0, 40], [3.2, 5]], dist=24, el=2, az0=-2, az1=2, fov=34, shiftX=-200)),
    ("0:23.36", G("bh", disk=0, starDir=[0.0, 0.0, -1], star=6, bhK=[[0, 0], [BH_ON - 23.36 - 0.4, 0], [BH_ON - 23.36 + 1.4, 1]],
                  dist=26, el=2, az0=-4, az1=4, fovK=[[0, 38], [6.8, 30]], shiftX=240)),
    ("0:30.18", G("bh", dist0=34, dist1=28, el0=3, el1=5, az0=-12, az1=2, shiftX=300, **HERO)),
    ("0:34.72", G("bh", disk=0, dist=22, el=3, az0=10, az1=22, fov=42, skyRotSp=0.018, roll=-6)),
    ("0:41.00", G("bh", dist0=36, dist1=33, el=3, az0=-8, az1=-2, shiftX=470, **HERO, vid=dict(SHIP, ss=4, drift=(30, -10)))),
    ("0:44.64", G("bh", dist=30, el=2, az0=6, az1=10, fov=19, look0=[3.0, 0, 0], look1=[2.7, 0.1, 0], roll=-3, **HERO)),
    ("0:49.12", VD("nasa_iss_float", 0, zoom=(1.0, 1.05))),
    (t("sleep", 51.0) - 0.5, VD("nasa_iss_module", 8, zoom=(1.0, 1.06))),
    ("0:53.16", VD("px_wallclock_0", 0, zoom=(1.0, 1.1))),
    ("0:56.38", VD("nasa_orion_crescent", 2, crop=ORC, zoom=(1.0, 1.05))),
    ("0:59.18", VD("nasa_splash", 6, zoom=(1.0, 1.06))),
    ("1:01.84", VD("px_city_future_1", 0)),
    ("1:03.48", VD("px_phonemap_0", 0)),
    ("1:05.24", VD("px_crowd_1", 0, zoom=(1.0, 1.04))),
    ("1:07.26", VD("px_standing_0", 0, zoom=(1.0, 1.08))),
    (t("he's", 71.5), VD("px_oldman_1", 0, zoom=(1.0, 1.08), origin="55% 35%")),
    ("1:13.82", VD("px_whitehair_0", 0)),
    ("1:15.12", VD("px_oldhands_0", 0)),
    ("1:16.46", VD("px_grandkids_0", 0)),
    ("1:18.94", VD("px_hourglass_1", 0)),
    ("1:20.80", VD("px_whitehair_1", 0, zoom=(1.0, 1.06))),
    # ---- Interstellar beat (no film clips: our own render + stock) ----
    ("1:23.84", G("bh", dist0=80, dist1=66, el0=14, el1=8, az0=20, az1=40, shiftX=-240, spin=1.3, **BIG)),
    ("1:27.70", VD("px_screenwatch_1", 0, zoom=(1.0, 1.08))),
    ("1:35.50", VD("px_screenwatch_0", 0, zoom=(1.0, 1.06))),
    ("1:38.12", VD("px_graduation_0", 0)),
    ("1:39.52", VD("px_wedding_1", 0)),
    ("1:40.76", VD("px_baby_0", 0)),
    ("1:42.06", VD("px_hourglass_0", 0, zoom=(1.0, 1.06))),
    ("1:44.98", G("bh", dist=28, el=2, az0=30, az1=36, fov=18, look0=[3.2, 0, 0], look1=[2.8, 0, 0], **HERO)),
    ("1:49.08", G("bh", dist0=44, dist1=38, el=6, az0=-20, az1=-10, shiftX=-280, roll=4, **HERO)),
    ("1:50.36", VD("px_crowd_0", 0)),
    ("1:54.60", G("bh", dist0=62, dist1=50, el0=10, el1=6, az0=-30, az1=-12, shiftX=300, **BIG,
                  ov=TITLE("What If You Traveled to a Black Hole<br>and Came Back to Earth?", 115.6, "2:03.20", 150, 640, 78))),
    # ================= PART ONE =================
    ("2:03.20", CARD("PART ONE", "The Universal Clock")),
    (t("time", 125.0), VD("px_sundial_0", 0, zoom=(1.0, 1.06))),
    ("2:07.42", G("earth", dist0=3.0, dist1=2.6, el=8, az0=150, az1=160, sun=[-65, 6], sx=-280)),
    (t("moon", 128.5), PH("moon_full", mode="card", bg="black", maxh=760, zoom=(1.0, 1.05))),
    (t("sun", 130.0), PH("sun_sdo", mode="card", bg="black", maxh=780, zoom=(1.0, 1.05))),
    (t("far", 131.5), PH("hudf", zoom=(1.0, 1.12), origin="45% 55%")),
    ("2:14.14", VD("px_gears_1", 0)),
    ("2:18.36", PH("einstein_1921", crop=(0.0, 0.0, 1.0, 0.62), zoom=(1.0, 1.1), origin="62% 30%")),
    ("2:23.04", PH("einstein_head", crop=(0.0, 0.05, 1.0, 0.65), zoom=(1.0, 1.08), origin="50% 35%")),
    ("2:27.66", G("well", mass="none", depth=0.0, dist0=16, dist1=13, el0=14, el1=20, az0=-20, az1=0, sx=0)),
    ("2:33.82", G("well", mass="earth", r=0.8, depthK=[[0, 0], [0.6, 0], [2.6, 2.6]], dropK=[[0, 3.0], [2.2, 0]], dist=13, el=18, az0=0, az1=8, sx=-200)),
    ("2:36.88", G("well", mass="sun", r=1.2, depth=4.2, wa=1.6, dist0=17, dist1=15, el=16, az0=20, az1=30, sx=240)),
    (t("Earth", 158.0), G("well", mass="earth", r=0.8, depth=2.4, dist=12, el=12, az0=-30, az1=-22, sx=-220)),
    (t("even", 159.0), VD("px_silhouette_1", 0)),
    ("2:42.04", VD("px_skydive_0", 0)),
    ("2:44.26", G("well", mass="earth", r=0.8, depth=3.0, dist0=11, dist1=10, el=6, az0=40, az1=55, roll=-4)),
    ("2:48.06", VD("px_pocketwatch_0", 0, zoom=(1.0, 1.08))),
    ("2:50.10", G("well", mass="earth", r=0.8, depth=3.4, distK=[[0, 15], [5.8, 6.5]], elK=[[0, 30], [5.8, 16]], az0=0, az1=20, ease="in")),
    ("2:55.88", G("bh", dist=26, el=2, az0=50, az1=56, fov=17, look0=[3.0, 0, 0], look1=[2.6, 0.1, 0], **HERO)),
    ("2:58.52", G("bh", dist0=48, dist1=42, el=7, az0=-30, az1=-18, shiftX=-300, **HERO)),
    ("3:01.76", VD("px_standing_1", 0, zoom=(1.0, 1.1), origin="40% 60%")),
    ("3:05.14", VD("px_silhouette_0", 0, zoom=(1.0, 1.06))),
    # ---- clocks on Earth ----
    ("3:07.56", PH("nist_clock", mode="card", bg="black", maxh=760, zoom=(1.0, 1.06))),
    ("3:17.62", VD("px_gears_0", 0)),
    ("3:22.98", VD("px_digitalclock_0", 0)),
    ("3:25.24", VD("px_books_0", 0)),
    ("3:30.70", VD("px_pocketwatch_1", 0)),
    ("3:36.00", G("earth", dist0=2.4, dist1=2.1, el=10, az0=200, az1=214, sun=[-70, 10], sx=260)),
    ("3:42.86", VD("px_standing_0", 3, zoom=(1.08, 1.0), origin="50% 30%")),
    ("3:45.92", VD("px_clocks_many_0", 0)),
    ("3:51.00", VD("px_skyscraper_0", 0, zoom=(1.0, 1.08))),
    ("3:56.28", VD("px_climbers_1", 0)),
    (t("compared", 239.0), VD("px_everest_1", 0)),
    ("4:03.60", VD("px_nightsky_0", 0)),
    ("4:06.96", VD("px_jet_takeoff_1", 0)),
    ("4:15.24", VD("px_cabin_1", 0)),
    ("4:21.80", G("earth", dist0=2.3, dist1=2.0, el=18, az0=-40, az1=40, sun=[-80, 5], rot=8, sx=0)),
    ("4:30.58", VD("px_clocks_many_1", 0, zoom=(1.0, 1.06))),
    ("4:32.62", VD("px_clouds_wing_1", 0)),
    ("4:36.40", VD("px_clouds_wing_0", 0)),
    ("4:39.94", VD("px_contrail_1", 0)),
    ("4:42.92", VD("px_jet_takeoff_0", 0)),
    ("4:45.86", VD("nasa_iss_clouds", 12)),
    ("4:52.28", PH("einstein_patent", crop=(0.0, 0.02, 1.0, 0.6), zoom=(1.0, 1.08), origin="50% 40%")),
    ("4:57.14", VD("px_lighttrails_0", 0)),
    ("5:02.48", VD("px_carnav_1", 0)),
    ("5:07.60", VD("px_phonemap_1", 0)),
    (t("fleet", 310.0), PH("gps_sat", crop=(0.05, 0.12, 0.95, 0.72), zoom=(1.0, 1.1), origin="55% 45%")),
    ("5:17.84", G("earth", dist0=6.5, dist1=5.6, el=22, az0=100, az1=112, sun=[-60, 10], sx=-240)),
    ("5:24.98", VD("nasa_iss_limb", 15)),
    ("5:32.48", PH("gps_sat", mode="card", bg="black", maxh=780, zoom=(1.0, 1.05))),
    ("5:38.18", VD("px_cityaerial_1", 0)),
    ("5:44.80", VD("px_cityaerial_0", 0)),
    ("5:49.36", VD("px_carnav_0", 0)),
    ("5:55.10", VD("nasa_iss_limb", 0)),
    ("5:59.10", VD("nasa_iss_soyuz", 0)),
    ("6:05.46", VD("nasa_iss_clouds", 0)),
    ("6:11.32", PH("scott_kelly_iss", zoom=(1.0, 1.1), origin="35% 45%")),
    ("6:18.90", PH("kelly_twins", zoom=(1.0, 1.08), origin="50% 30%")),
    ("6:24.70", PH("padalka", zoom=(1.0, 1.1), origin="20% 45%")),
    ("6:31.50", VD("nasa_iss_limb", 9)),
    ("6:36.64", VD("px_pocketwatch_0", 5)),
    ("6:40.66", G("bh", dist0=66, dist1=52, el=8, az0=10, az1=26, shiftX=-260, **HERO)),
    # ================= PART TWO =================
    ("6:45.70", CARD("PART TWO", "Leaving Home")),
    ("6:47.62", G("sun", img=IMGP("sun_sdo"), diskFrac=0.86, dist0=820, dist1=700, el=3, az0=-10, az1=4, sx=-260, earthAt=[-160, 0, 60])),
    ("6:51.54", PH("sun_sdo", crop=(0.55, 0.08, 1.0, 0.5), zoom=(1.0, 1.1), origin="60% 40%")),
    ("6:59.58", G("sun", img=IMGP("sun_sdo"), diskFrac=0.86, dist0=420, dist1=380, el=2, az0=20, az1=26, sx=320)),
    ("7:02.42", PH("sun_sdo", mode="card", bg="black", maxh=800, zoom=(1.05, 1.0))),
    ("7:08.74", VD("nasa_sn_pulsar", 0)),
    ("7:13.08", VD("nasa_sn_pulsar", 24)),
    ("7:17.94", VD("nasa_neutron_star", 2)),
    (t("roughly", 439.0), VD("px_city_future_0", 0)),
    (t("yet", 442.0), VD("nasa_magnetar", 4)),
    ("7:24.70", VD("px_spoon_0", 0)),
    ("7:28.22", VD("nasa_ns_spots", 0)),
    ("7:36.54", VD("px_friends_group_0", 0)),
    ("7:42.06", G("bh", disk=0, distK=[[0, 46], [3.0, 38]], el=4, az0=0, az1=8, fov=36, shiftX=260)),
    ("7:45.10", G("bh", disk=0, dist0=24, dist1=20, el=3, az0=20, az1=30, fov=40, roll=-5)),
    ("7:49.62", G("bh", disk=0, starDir=[0.02, 0.01, -1], star=28, dist=24, el=2, az0=-3, az1=3, fov=30, shiftX=-240)),
    ("7:56.96", G("bh", dist0=36, dist1=30, el=4, az0=-14, az1=-4, shiftX=300, **HERO)),
    # ================= PART THREE =================
    ("8:02.24", CARD("PART THREE", "The Edge")),
    ("8:04.68", G("bh", distK=[[0, 44], [5.0, 33]], el=4, az0=-6, az1=4, shiftX=470, **HERO, vid=dict(SHIP, ss=8, drift=(20, 0)))),
    ("8:09.70", G("bh", distK=[[0, 20], [4.7, 13]], el=2, az0=10, az1=30, rollK=[[0, 0], [4.7, -7]], ease="in", **HERO)),
    ("8:14.42", G("bh", dist=32, el=4, az0=0, az1=4, fov=32, shiftX=-260, **HERO)),
    ("8:17.86", G("bh", dist=16, el=3, az0=8, az1=12, fov=36, shiftX=200, **HERO)),
    ("8:20.48", G("bh", dist=9, el=2, az0=14, az1=18, fov=40, **HERO)),
    (t("thousand", 501.5), G("bh", dist=5.2, el=2, az0=20, az1=26, fov=44, roll=6, **HERO)),
    ("8:23.78", G("bh", distK=[[0, 7.0], [6.2, 4.9]], el=2, az0=30, az1=44, rollK=[[0, 6], [6.2, 14]], ease="in", **HERO)),
    ("8:30.02", VD("px_oldman_1", 5, zoom=(1.0, 1.08), origin="55% 35%")),
    ("8:33.64", G("bh", dist=27, el=1.5, az0=70, az1=74, fov=16, look0=[2.9, 0, 0], look1=[2.6, 0.05, 0], **HERO)),
    ("8:36.32", G("bh", dist0=90, dist1=76, el0=12, el1=8, az0=-20, az1=-4, shiftX=280, spin=1.4, **BIG)),
    (t("every", 521.0), VD("px_waves_big_0", 0)),
    ("8:44.50", G("bh", dist=60, el=5, az0=30, az1=40, shiftX=-260, spin=1.4, **BIG)),
    ("8:46.92", PH("kip_thorne", crop=(0.0, 0.05, 1.0, 0.7), zoom=(1.0, 1.08), origin="50% 35%")),
    ("8:52.62", G("bh", dist0=70, dist1=60, el0=34, el1=26, az0=0, az1=50, spin=1.6, speed=2.4, shiftX=-200, **BIG)),
    ("9:00.64", G("bh", dist0=40, dist1=34, el=3, az0=-30, az1=-20, shiftX=300, spin=1.4, **BIG)),
    ("9:03.08", G("bh", dist0=36, dist1=33, el=3, az0=4, az1=10, shiftX=470, **HERO, vid=dict(SHIP, ss=12, drift=(-20, 0)))),
    ("9:07.78", VD("px_nightsky_0", 2, speed=3.0, grade=PXG + ",colorbalance=bs=0.08:bm=0.05")),
    ("9:13.98", G("bh", disk=0, dist=26, el=3, az0=0, az1=10, fov=44, skyRotSp=0.05, exposure=1.3)),
    ("9:19.00", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, dist0=160, dist1=130, el0=56, el1=46, az0=0, az1=30, spin=40, sx=-150)),
    ("9:25.18", VD("px_telescope_0", 0)),
    ("9:30.16", G("bh", dist=34, el=3, az0=-4, az1=-2, shiftX=470, **HERO, vid=dict(SHIP, ss=2, speed=0.35))),
    ("9:35.76", G("bh", dist=34, el=3, az0=-2, az1=-1, shiftX=470, **HERO,
                  vid=dict(SHIP, ss=4, speed=0.25, fade=(t("red", 576.5) - 0.2, 1.4)),
                  vid2=dict(SHIP, ss=4, speed=0.25, grade=RED, fade=(t("away", 579.0), 1.0)))),
    ("9:40.68", G("bh", disk=0, dist=26, el=2, az0=40, az1=44, fov=18, look0=[2.7, 0, 0], look1=[2.6, 0.05, 0])),
    ("9:43.98", G("earth", dist0=3.0, dist1=2.7, el=6, az0=10, az1=20, sun=[-60, 6], sx=260)),
    (t("both", 587.0), G("bh", dist=36, el=4, az0=-20, az1=-12, shiftX=-300, **HERO)),
    # ================= PART FOUR =================
    ("9:49.02", CARD("PART FOUR", "Why Time Bends")),
    ("9:53.64", VD("px_pendulum_0", 0, zoom=(1.0, 1.08))),
    ("9:58.74", VD("px_clocks_many_0", 3)),
    ("10:00.30", VD("px_wave_slow_0", 0)),
    ("10:02.42", VD("px_prism_1", 0)),
    ("10:04.42", G("well", mass="sun", r=1.1, depth=4.6, wa=1.4, distK=[[0, 7], [3.7, 14]], elK=[[0, 10], [3.7, 34]], az0=0, az1=14, ease="out")),
    ("10:08.10", G("bh", dist=24, el=3, az0=60, az1=66, fov=20, look0=[3.4, 0, 0], look1=[3.0, 0, 0], **HERO)),
    ("10:13.66", G("well", mass="sun", r=1.1, depth=4.6, wa=1.4, dist0=22, dist1=19, el0=48, el1=42, az0=-30, az1=-14, sx=200)),
    ("10:22.36", G("bh", dist0=34, dist1=30, el=5, az0=-10, az1=0, shiftX=-300, **HERO)),
    ("10:25.58", VD("px_pocketwatch_1", 3)),
    ("10:30.46", PH("jefferson_lab", zoom=(1.0, 1.1), origin="40% 45%")),
    ("10:39.48", PH("einstein_1921", crop=(0.25, 0.04, 0.95, 0.42), zoom=(1.0, 1.08), origin="50% 40%")),
    ("10:45.76", VD("px_university_0", 0)),
    ("10:49.38", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, dist0=150, dist1=175, el0=40, el1=48, az0=20, az1=36, sx=180)),
    ("10:52.38", VD("px_climbers_0", 0)),
    ("10:56.84", VD("nasa_iss_clouds", 7)),
    ("11:01.24", G("sun", img=IMGP("sun_sdo"), diskFrac=0.86, dist0=520, dist1=470, el=3, az0=0, az1=8, sx=-300)),
    ("11:04.78", VD("nasa_neutron_star", 9)),
    ("11:07.16", G("bh", distK=[[0, 40], [8.2, 12]], el=4, az0=-10, az1=12, rollK=[[0, 0], [8.2, -6]], ease="inout", **HERO)),
    ("11:15.32", VD("px_gears_0", 4)),
    ("11:18.10", VD("px_nightsky_0", 8)),
    ("11:19.62", VD("px_clocks_many_1", 3)),
    ("11:21.82", G("earth", dist0=3.2, dist1=2.8, el=10, az0=80, az1=94, sun=[-70, 8], sx=-260)),
    ("11:27.40", VD("nasa_launchpad_n", 7, zoom=(1.08, 1.0))),
    ("11:30.44", VD("px_oldman_1", 2, zoom=(1.0, 1.06), origin="55% 35%")),
    (t("stolen", 694.0), VD("px_whitehair_0", 4)),
    ("11:38.08", VD("px_oldhands_0", 4)),
    ("11:39.64", VD("px_standing_0", 6, zoom=(1.0, 1.06))),
    ("11:42.54", VD("px_pocketwatch_0", 8)),
    ("11:45.50", G("earth", dist0=2.5, dist1=2.2, el=4, az0=170, az1=182, sun=[-45, 8], sx=200)),
    ("11:53.24", G("bh", dist0=34, dist1=30, el=4, az0=-14, az1=-6, shiftX=-300, **HERO)),
    ("11:55.50", G("bh", dist0=58, dist1=50, el0=9, el1=6, az0=10, az1=24, shiftX=260, spin=1.3, **BIG)),
    ("11:58.60", VD("px_silhouette_0", 3, zoom=(1.0, 1.06))),
    ("12:06.94", G("bh", dist0=44, dist1=40, el=6, az0=-30, az1=-20, shiftX=300, **HERO)),
    ("12:15.10", G("bh", dist0=72, dist1=64, el=8, az0=-10, az1=0, shiftX=-300, **HERO, ov=TITLE("Outside Lay", s("12:15.60"), None, 1080, 640, 96))),
]


def write_part(k, parts):
    p0, p1 = parts[k], parts[k + 1]
    html.clear(); tl.clear(); sps.clear()
    ST.update(off=p0, n=10)
    for i, (st, fn) in enumerate(SHOTS):
        a = s(st); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        ST["skip"] = not (p0 - 0.05 <= a < p1 - 0.05)
        if abs(a - p0) < 0.05: a = p0
        nxt = SHOTS[i + 1][1] if i + 1 < len(SHOTS) else None
        last_in_part = i + 1 >= len(SHOTS) or s(SHOTS[i + 1][0]) >= p1 - 0.05
        if nxt is not None and getattr(nxt, "dip", False) and not ST["skip"]:   # fade to black into a chapter card
            did = nid("dip"); tw(f"#{did}", {"opacity": 1}, b - 0.7, 0.7, {"opacity": 0}, "power1.in")
            layer(b - 0.7, b, f'<div id="{did}" class="black" style="opacity:0"></div>', fin=0, z=9400)
        if fn.k == "3d":
            fn(a, b); continue
        bx = min(b, p1) if last_in_part else b
        if fn.k == "vid" and not os.path.exists(src_path(fn(a, b)[1])):
            _, src, ss, kw, ov = fn(a, b); print("MISSING clip", src)
            layer(a, bx, '<div class="black"></div>' + (ov(a, bx) if ov else ""), fin=0)
        elif fn.k == "vid":
            _, src, ss, kw, ov = fn(a, bx)
            ST["n"] += 1
            if not ST["skip"]:
                wid, v = nid("w"), nid("v")
                clip = trim(src, ss, bx - a, kw.get("speed", 1.0), kw.get("crop"), kw.get("grade", ""))
                html.append(f'<div id="{wid}" class="vw" style="left:0;top:0;width:1920px;height:1080px;z-index:{ST["n"]}"><video id="{v}" class="clip fit" src="{clip}" muted playsinline '
                            f'data-start="{T(a)}" data-duration="{bx - a:.3f}" data-track-index="1" style="transform-origin:{kw.get("origin", "50% 50%")}"></video></div>')
                z = kw.get("zoom", (1.0, 1.06)); tw(f"#{v}", {"scale": z[1]}, a, bx - a, {"scale": z[0]}, "none")
            if ov: layer(a, bx, ov(a, bx), fin=0)
        else:
            layer(a, bx, fn(a, bx), fin=0)
    # cinematic finish: 2.2:1 letterbox, soft vignette, fine moving film grain (whole part)
    ST["skip"] = False
    dur = p1 - p0; gid = nid("grain"); steps = int(dur * 24)
    tw(f"#{gid}", {"backgroundPositionX": steps * 37, "backgroundPositionY": steps * 53}, p0, dur, {"backgroundPositionX": 0, "backgroundPositionY": 0}, f"steps({steps})")
    layer(p0, p1, f'<div class="vign"></div><div id="{gid}" class="grain"></div><div class="lbx top"></div><div class="lbx bot"></div>', fin=0, z=9800)
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/three.min.js"></script>
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
<script src="assets/js/kinds_ep4.js"></script>
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


# parts split at chapter cards (each card starts with a dip from black, so seams are invisible)
PARTS = [0.0, s("2:03.20"), s("6:45.70"), s("8:02.24"), s("9:49.02"), END]

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
