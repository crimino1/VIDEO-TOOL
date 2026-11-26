"""Every Deep Sea Predator Explained In 9 Minutes (Unseen Kingdom). Writes parts/p1..p4.html, sfx.json and usage.json.
Voice: assets/vo.wav (553.26 s). Animals in the animation are real photo cut-outs (assets/cut) moved on canvas by assets/js/deep.js + sc.js."""
import json, sys, re, glob
from lib import *
from scenes_pred import *

END = 553.26
PARTS = [round(x * 30) / 30 for x in (0.0, s("2:26.40"), s("4:21.88"), s("6:29.88"), END)]
ROT = {}


def pick(src):
    if not src.startswith("px_") or re.search(r"_\d+$", src): return src
    opts = sorted(glob.glob(str(H / "assets" / "raw" / (src + "_*.mp4"))))
    if not opts: return src + "_0"
    k = ROT.get(src, 0); ROT[src] = k + 1
    return Path(opts[k % len(opts)]).stem


CREDIT = {"sword_noaa2": "Footage: NOAA Ocean Exploration", "humb_onc": "Footage: Ocean Networks Canada", "humb_dive": "Footage: Alfredo Barroso", "humb_usf": "Footage: USF Marine Science",
          "humb_grant": "Footage: grantisme", "viper_mbari": "Footage: MBARI", "viper_mbari2": "Footage: MBARI", "dragon_mbari": "Footage: MBARI", "dragon_black": "Footage: MBARI",
          "swallow_ok": "Footage: NOAA Okeanos Explorer / Inner Space Center", "gulper_naut": "Footage: Ocean Exploration Trust / Nautilus Live", "gulper_mbari": "Footage: MBARI",
          "goblin_uwa": "Footage: Minderoo-UWA Deep-Sea Research Centre", "frilled_2004": "Footage: NOAA (2004)", "green_subc": "Footage: Marine Institute / SubC Imaging",
          "green_bait": "Footage: Rachel A.S. Forbes", "green_first": "Footage: ArtificialSoul", "gsquid_noaa": "Footage: Edie Widder & Nathan Robinson / NOAA Ocean Exploration",
          "tunic_mbari": "Footage: MBARI", "tunic_naut": "Footage: Ocean Exploration Trust / Nautilus Live", "harp_mbari": "Footage: MBARI", "harp_four": "Footage: MBARI",
          "dumbo_naut": "Footage: Ocean Exploration Trust / Nautilus Live", "dumbo_4k": "Footage: Ocean Exploration Trust / Nautilus Live", "dumbo_trio": "Footage: Ocean Exploration Trust / Nautilus Live",
          "angler_pair": "Footage: Kirchgessner / Rebikoff-Niggeler Foundation", "angler_noaa": "Footage: NOAA Ocean Exploration", "fang_noc": "Footage: National Oceanography Centre",
          "fang_mbari": "Footage: MBARI", "tripod": "Footage: Serpent Project", "snail_caladan": "Footage: Caladan Oceanic / Inkfish", "snail_naut": "Footage: Ocean Exploration Trust / Nautilus Live",
          "snail_deepest": "Footage: University of Western Australia / Minderoo-UWA", "amphi_super": "Footage: Caladan Oceanic", "hatchet": "Footage: NOAA / GFOE", "snow_mbari": "Footage: MBARI",
          "soi_deep": "Footage: Schmidt Ocean Institute", "sperm_dominica": "Footage: Nadia Aly Underwater", "sperm_fluke": "Footage: Recalibrated Robot", "sperm_surfacing": "Footage: Adventuring Dave",
          "iceseal": "Footage: Laag Ni Ivan"}
MB = (0.16, 0.0, 1.0, 0.84)          # MBARI triangle, lower left
MBT = (0.0, 0.1, 0.88, 1.0)          # MBARI word mark, upper right
HARP = (0.135, 0.0, 0.88, 0.85)      # pillarboxed 4:3 with the logo in the bar
DOMC = (0.0, 0.0, 0.85, 0.86)        # SeaLife bug at lower right


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


# ---------------- the animals: photo cut-outs and how each one swims ----------------
HP = {
    "sword": dict(img="img_swordfish", len=1000, headRight=False, bend=0.45, amp=0.03, beat=0.8, angle=-0.39, hi=0.18, lo=0.35),
    "viper": dict(img="img_viper", len=1300, headRight=True, bend=0.45, amp=0.025, beat=0.5, rim=[90, 150, 180, 0.35], lo=0.3),
    "loose": dict(img="img_loosejaw2", len=1250, headRight=True, bend=0.5, amp=0.03, beat=0.5, rim=[150, 90, 70, 0.3]),
    "dragon": dict(img="img_dragon", len=900, headRight=False, bend=0.5, amp=0.015, beat=0.4),
    "angler": dict(img="img_angler", len=760, headRight=False, bend=0.65, amp=0.025, beat=0.35, rim=[110, 150, 160, 0.35], lo=0.25),
    "fang": dict(img="img_fangtooth", len=950, headRight=False, bend=0.55, amp=0.035, beat=0.6, rim=[150, 120, 110, 0.3]),
    "swallow": dict(img="img_swallower", len=1150, headRight=True, bend=0.5, amp=0.035, beat=0.6, rim=[110, 130, 150, 0.35]),
    "swallowF": dict(img="img_swallower_full", len=1050, headRight=False, bend=0.6, amp=0.015, beat=0.3, rim=[110, 130, 150, 0.3]),
    "gulper": dict(img="img_gulper", len=1350, headRight=False, bend=0.35, amp=0.05, beat=0.4, waves=2.0, rim=[90, 120, 140, 0.4]),
    "goblin": dict(img="img_goblin", len=1500, headRight=False, bend=0.35, amp=0.035, beat=0.4, rim=[150, 120, 120, 0.25]),
    "frilled": dict(img="img_frilled", len=1500, headRight=False, bend=0.15, amp=0.055, beat=0.45, waves=3.2, rim=[100, 140, 150, 0.3]),
    "green": dict(img="img_greenland", len=1400, headRight=True, bend=0.4, amp=0.03, beat=0.25),
    "gsquid": dict(img="img_giantsquid", len=1700, headRight=False, bend=0.35, amp=0.035, beat=0.3, lo=0.3),
    "humb": dict(img="img_humboldt2", len=520, headRight=True, bend=0.5, amp=0.04, beat=1.2, hi=0.2),
    "sperm": dict(img="img_sperm", len=1500, headRight=True, bend=0.42, amp=0.045, beat=0.3),
    "dumbo": dict(img="img_dumbo", len=560, headRight=True, bend=0.7, amp=0.02, beat=0.5, hi=0.15),
    "snail": dict(img="img_snail", len=720, headRight=False, bend=0.35, amp=0.06, beat=0.6, hi=0.2),
}
def hh(name, **kw):
    d = dict(HP[name]); d.update(kw); return d


DEEP = dict(depth=0.85, biolum=30, snow=260)
BLACK = dict(depth=1.0, biolum=40, snow=220)
CAM = lambda z0=1.0, z1=1.07, **k: dict(z0=z0, z1=z1, **k)
PREY4 = [dict(t0=0.4, x0=1500, y0=300, x1=1150, y1=420, len=70, flip=True), dict(t0=0.9, x0=1650, y0=620, x1=1250, y1=520, len=60, flip=True, eat=1),
         dict(t0=1.2, x0=1550, y0=820, x1=1300, y1=640, len=55, flip=True), dict(t0=0.2, x0=1700, y0=450, x1=1350, y1=430, len=65, flip=True)]

SHOTS = [
    # ---------------- HOOK
    ("0:00.02", A("descend", d0=0.35, d1=0.8, rise=30, ov=lambda a, b: fade_in_black(a, 1.5))),
    ("0:02.94", V("yt:snow_mbari", 3, crop=MB)),
    ("0:05.16", A("swim", **DEEP, school=dict(n=26, cx=900, cy=520, rx=420, ry=170, len=70, dir=1, speed=40, seed=3), cam=CAM())),
    ("0:06.76", V("yt:viper_mbari", 12, crop=MB)),
    ("0:09.65", A("lure", **BLACK, hero=hh("angler", x=780, y=560), lure=[0.04, 0.27, 16, [120, 230, 255]], mouth=[0.06, 0.42], prey=PREY4[:2], cam=CAM(1.0, 1.12))),
    ("0:11.51", A("slingshot", **DEEP, hero=hh("goblin", x=1000, y=560), jaw=[0.075, 0.56, 0.215, 0.98], tStrike="0:12.3", prey=[250, 600, 110], cam=CAM(1.05, 1.1),
                  ov=FX("thud", "0:12.3", 0.8))),
    ("0:13.82", A("swallow", **DEEP, hero=hh("swallow", x=1000, y=480), prey=dict(img="img_lantern", len=900, x0=1900, headRight=False, flip=False), belly=[0.55, 0.62], bellyR=0.2, tGulp="0:14.4", cam=CAM(1.0, 1.08))),
    ("0:18.38", V("yt:dragon_black", 48, crop=MBT, ov=TT("EVERY DEEP-SEA PREDATOR", "0:18.6", "0:21.4", size=170))),
    ("0:21.52", V("px_rays", 0)),
    ("0:23.10", V("yt:snail_caladan", 30, crop=(0.06, 0.18, 1.0, 1.0))),
    ("0:26.18", A("descend", d0=0.2, d1=0.55, rise=40, ov=DC("200 M", "WHERE THE LIGHT BEGINS TO DIE", "0:28.3"))),
    # ---------------- SWORDFISH
    ("0:30.68", V("yt:sword_noaa2", 17, ov=NM("SWORDFISH", "0:30.9"))),
    ("0:32.04", A("swim", depth=0.12, surfaceY=70, snow=120, heroes=[hh("sword", path=[[0, 2200, 360], [2.2, 900, 330]], angle=-0.3)], cam=CAM(1.0, 1.05))),
    ("0:34.08", A("descend", d0=0.15, d1=0.7, rise=25, silhouette=hh("sword", path=[[0, 1700, 250], [4.2, 500, 750]], angle=0.15, fog=[10, 40, 60, 0.3]), ov=ST_("DOWN HUNDREDS OF METRES AT NIGHT", "0:35.2", "0:38.2"))),
    ("0:38.32", V("yt:sword_noaa2", 24)),
    ("0:42.69", A("heater", depth=0.6, snow=200, hero=hh("sword", x=1550, y=600, len=1500), heat=[0.2, 0.14], eye=[0.18, 0.13], tHeat="0:43.6", cam=CAM(1.0, 1.12),
                  ov=both(LB("EYES AND BRAIN", "0:44.2", 1080, 690), ST_("UP TO 15°C WARMER THAN THE WATER", "0:46.0", "0:49.2")))),
    ("0:49.27", V("yt:sword_noaa2", 38)),
    ("0:51.47", A("swim", **DEEP, heroes=[hh("sword", path=[[0, 2100, 520], [3.0, 1350, 540], [3.6, 700, 560]], glows=[[0.18, 0.13, 10, [255, 190, 90], 1.2, 0.8]])],
                  school=dict(n=24, cx=600, cy=520, rx=260, ry=140, len=60, dir=-1, speed=10, flee=[3.2, 800, 540], seed=5), cam=CAM(1.0, 1.06))),
    # ---------------- HUMBOLDT SQUID
    ("0:56.98", V("yt:humb_onc", 10.6, ov=NM("HUMBOLDT SQUID", "0:57.9"))),
    ("0:59.56", V("yt:humb_grant", 56, ov=ST_("THE RED DEVIL", "0:59.9", "1:02.3", size=110))),
    ("1:02.46", S(size_compare, [("diver_sil", 1.8, "DIVER", False), ("humboldt2", 1.5, "HUMBOLDT SQUID · ~1.5 M", True)], ["1:02.6", "1:03.4"], 4.0)),
    ("1:05.78", A("pack", depth=0.55, snow=220, n=5, tStrike="1:08.4", cam=CAM(1.0, 1.08),
                  heroes=[hh("humb", path=[[0, -300, 380], [5, 1200, 430]]), hh("humb", path=[[0, -500, 620], [5, 1100, 600]], len=460), hh("humb", path=[[0, -200, 760], [5, 1300, 760]], len=420),
                          hh("humb", path=[[0, -700, 300], [5, 900, 300]], len=380), hh("humb", path=[[0, -900, 520], [5, 800, 520]], len=480)],
                  school=dict(n=30, cx=1350, cy=520, rx=380, ry=200, len=55, dir=1, speed=15, flee=[2.6, 1150, 520], seed=7))),
    ("1:10.84", PH("humboldt2", zoom=(1.05, 1.25), origin="15% 50%", ov=LB("SUCKERS RINGED WITH TEETH", "1:11.6", 700, 360))),
    ("1:14.84", V("yt:humb_dive", 88)),
    ("1:17.60", A("descend", d0=0.45, d1=0.7, rise=40, ov=DC("500 M", "NOW IT'S NEARLY DARK", "1:19.95"))),
    # ---------------- VIPERFISH
    ("1:22.18", V("yt:viper_mbari", 14, crop=MB, ov=NM("VIPERFISH", "1:22.4"))),
    ("1:26.14", A("swim", **DEEP, heroes=[hh("viper", x=900, y=560, len=1700)], cam=CAM(1.0, 1.35, x1=-500, y1=0),
                  ov=LB("FANGS OUTSIDE THE MOUTH", "1:28.8", 1150, 420))),
    ("1:33.98", A("lure", **BLACK, hero=hh("viper", x=760, y=600, len=1100), lure=[1.06, -0.32, 13, [140, 220, 255]], fil=[0.62, 0.06], mouth=[0.95, 0.55], prey=[], cam=CAM(1.0, 1.1))),
    ("1:39.74", V("yt:viper_mbari2", 46, crop=MB)),
    ("1:41.29", A("lure", **BLACK, hero=hh("viper", x=700, y=600, len=1100), lure=[1.06, -0.32, 13, [140, 220, 255]], fil=[0.62, 0.06], mouth=[0.95, 0.55],
                  prey=PREY4, tStrike="1:43.96", lungeDx=200, cam=CAM(1.0, 1.06), ov=FX("thud", "1:43.96", 0.9))),
    # ---------------- STOPLIGHT LOOSEJAW
    ("1:45.53", A("swim", **BLACK, heroes=[hh("loose", path=[[0, -800, 560], [4.5, 900, 540]])], torch=[960, 540, 900, 0.6], cam=CAM(1.0, 1.05),
                  ov=NM("STOPLIGHT LOOSEJAW", "1:46.4"))),
    ("1:50.31", S(light_depth, "1:50.9")),
    ("1:55.87", V("yt:hatchet", 16)),
    ("2:00.83", A("redbeam", **BLACK, hero=hh("loose", x=700, y=560), organ=[0.86, 0.34], tBeam="2:01.6", cam=CAM(1.0, 1.08),
                  shrimp=dict(n=10, cx=1500, cy=520, rx=260, ry=160, size=9, seed=21), ov=LB("RED LIGHT ORGAN", "2:04.6", 1160, 440))),
    ("2:10.07", A("redbeam", **BLACK, hero=hh("loose", x=600, y=600), organ=[0.86, 0.34], tBeam=0, preyView=["2:11.67", 99], cam=CAM(1.04, 1.1),
                  shrimp=dict(n=10, cx=1450, cy=560, rx=240, ry=150, size=10, seed=22), ov=ST_("WHAT THE PREY SEES: NOTHING", "2:12.0", "2:15.0"))),
    ("2:15.27", A("swim", **BLACK, heroes=[hh("loose", x=760, y=500, len=1900)], lamp=[1500, 600, 600], cam=CAM(1.0, 1.3, x1=-560, y1=-120),
                  ov=LB("NO FLOOR: JUST BONE", "2:17.2", 1240, 720))),
    ("2:20.18", A("lure", **BLACK, hero=hh("loose", x=700, y=560), lure=[0.86, 0.34, 9, [255, 40, 20]], mouth=[0.96, 0.62],
                  prey=[dict(t0=0.3, x0=1650, y0=520, x1=1350, y1=600, len=60, flip=True, eat=1)], preyImg="img_lantern", tStrike="2:23.18", lungeDx=140, cam=CAM(1.0, 1.06),
                  ov=FX("thud", "2:23.18", 0.8))),
    # ---------------- MIDNIGHT ZONE / DRAGONFISH
    ("2:26.40", A("descend", d0=0.7, d1=1.0, rise=40, ov=DC("1,000 M", "THE MIDNIGHT ZONE", "2:28.6"))),
    ("2:31.46", V("yt:dragon_black", 48, crop=MBT, ov=NM("BLACK DRAGONFISH", "2:32.3"))),
    ("2:34.86", A("ultrablack", **BLACK, hero=hh("dragon", x=960, y=540, len=1100), lamp0=[300, 400], lamp1=[1650, 620], lampR=460, cam=CAM(1.0, 1.05),
                  ov=both(lambda a, b: depth_card(s("2:37.32"), s("2:42.6"), "99.5%", "OF THE LIGHT THAT HITS THEM, ABSORBED", "2:38.6"), ST_("SHINE A LIGHT: IT BARELY SHOWS", "2:43.0", "2:45.9")))),
    ("2:46.02", V("yt:dragon_black", 184, crop=MBT, ov=ST_("A HOLE CUT INTO THE DARK", "2:46.3", "2:48.4"))),
    ("2:48.50", PH("dragon_head", zoom=(1.0, 1.15), origin="40% 60%", ov=LB("TRANSPARENT TEETH", "2:50.5", 760, 600))),
    # ---------------- ANGLERFISH
    ("2:54.55", V("yt:angler_pair", 62, crop=(0.0, 0.0, 0.86, 0.9), ov=NM("ANGLERFISH", "2:54.8"))),
    ("2:56.48", A("lure", **BLACK, hero=hh("angler", x=1050, y=620), lure=[0.04, 0.27, 18, [120, 230, 255]], mouth=[0.06, 0.42], prey=[], cam=CAM(1.0, 1.45, x1=520, y1=160),
                  ov=LB("FULL OF GLOWING BACTERIA", "2:57.8", 1080, 300))),
    ("3:00.84", A("lure", **BLACK, hero=hh("angler", x=1100, y=580), lure=[0.04, 0.27, 18, [120, 230, 255]], mouth=[0.06, 0.42], tStrike="3:03.30", lungeDx=-120,
                  prey=[dict(t0=0.2, x0=200, y0=360, x1=800, y1=470, len=70, flip=False, eat=1, flee=-600), dict(t0=0.6, x0=100, y0=700, x1=640, y1=620, len=60, flip=False, flee=-600)],
                  cam=CAM(1.0, 1.06), ov=FX("thud", "3:03.30", 0.9))),
    ("3:06.22", V("yt:angler_pair", 79, crop=(0.0, 0.0, 0.86, 0.9), ov=ST_("THE TINY MALE FUSES WITH HER FOR LIFE", "3:10.0", "3:15.3"))),
    # ---------------- FANGTOOTH
    ("3:15.52", V("yt:fang_mbari", 0, crop=(0.16, 0.0, 1.0, 0.84), ov=NM("FANGTOOTH", "3:15.8"))),
    ("3:17.34", V("yt:fang_noc", 31, crop=(0.0, 0.12, 1.0, 0.78), ov=ST_("ABOUT THE SIZE OF YOUR HAND", "3:17.6", "3:19.3"))),
    ("3:19.45", A("swim", **BLACK, heroes=[hh("fang", x=1000, y=540, len=1500)], lamp=[700, 500, 700], cam=CAM(1.0, 1.35, x1=560, y1=60),
                  ov=LB("BIGGEST TEETH FOR ITS SIZE", "3:21.0", 760, 650))),
    ("3:24.94", A("swim", **BLACK, heroes=[hh("fang", x=1100, y=560, len=1700, glows=[[0.16, 0.31, 18, [255, 170, 90], 1.0, 0.5, 2.6], [0.24, 0.3, 14, [255, 170, 90], 1.0, 0.5, 2.6]])],
                  lamp=[700, 500, 700], cam=CAM(1.1, 1.25, x0=500, x1=600, y0=80, y1=120), ov=LB("SOCKETS BESIDE THE BRAIN", "3:27.6", 960, 380))),
    # ---------------- BLACK SWALLOWER
    ("3:30.83", V("yt:swallow_ok", 27, crop=(0.12, 0.09, 1.0, 1.0), ov=NM("BLACK SWALLOWER", "3:31.6"))),
    ("3:33.17", S(size_compare, [("swallower", 0.25, "SWALLOWER · 25 CM", False), ("lantern", 0.55, "ITS PREY · OVER TWICE AS LONG", False)], ["3:33.4", "3:37.0"], 0.8)),
    ("3:39.70", A("swallow", **DEEP, hero=hh("swallow", x=1000, y=470, len=1250), prey=dict(img="img_lantern", len=1000, x0=2200, headRight=False), belly=[0.55, 0.62], bellyR=0.21, tGulp="3:40.0", cam=CAM(1.0, 1.1))),
    ("3:43.80", PH("swallower_full", zoom=(1.0, 1.1), ov=LB("THE PREY, CURLED INSIDE", "3:44.6", 900, 760))),
    ("3:47.02", A("swim", **DEEP, heroes=[hh("swallowF", x=960, y=560, len=1200, dark=0.15, tintCol=[60, 50, 20, 0.15])], cam=CAM(1.0, 1.06),
                  ov=ST_("THE MEAL CAN ROT BEFORE IT IS DIGESTED", "3:50.5", "3:53.0"))),
    ("3:53.14", A("floatup", hero=hh("swallowF", len=1000, flip=False), belly=[0.4, 0.75], bellyR=0.0, ov=ST_("FOUND DEAD AT THE SURFACE", "3:56.0", "4:01.0"))),
    # ---------------- GULPER EEL
    ("4:01.20", V("yt:gulper_naut", 51, ov=NM("GULPER EEL", "4:01.6"))),
    ("4:04.20", V("yt:gulper_naut", 62)),
    ("4:09.44", A("gulper", **DEEP, hero=hh("gulper", path=[[0, 1500, 560], [7.7, 900, 540]]), jaw=[0.12, 0.55], tOpen=99, noPouch=1,
                  shrimp=dict(n=40, cx=700, cy=560, rx=420, ry=240, size=8, seed=31), cam=CAM(1.0, 1.08), ov=ST_("MOSTLY SMALL SHRIMP", "4:13.4", "4:17.0"))),
    ("4:17.18", V("yt:gulper_naut", 85, ov=ST_("LESS A WEAPON, MORE A NET", "4:18.2", "4:21.7"))),
]
SHOTS += [
    # ---------------- SHARKS
    ("4:21.88", A("swim", **DEEP, heroes=[hh("goblin", path=[[0, 2300, 560], [4.4, 1000, 540]])], cam=CAM(1.0, 1.05),
                  ov=both(TT("NOW THE SHARKS", "4:21.95", "4:23.4", size=150), NM("GOBLIN SHARK", "4:23.6")))),
    ("4:26.32", A("slingshot", **DEEP, hero=hh("goblin", x=1050, y=560, len=1700), jaw=[0.075, 0.56, 0.215, 0.98], tStrike="4:27.89", prey=[260, 610, 120], cam=CAM(1.05, 1.12),
                  ov=FX("thud", "4:27.89", 0.9))),
    ("4:35.03", A("slingshot", **DEEP, hero=hh("goblin", x=1250, y=520, len=2600), jaw=[0.075, 0.56, 0.215, 0.98], tStrike="4:35.6", slow=5, prey=[300, 600, 160], cam=CAM(1.15, 1.2, x0=300, x1=320),
                  ov=ST_("SLINGSHOT FEEDING", "4:37.33", "4:39.9", size=110))),
    ("4:40.02", V("yt:frilled_2004", 26, crop=(0.0, 0.2, 0.92, 0.95), ov=NM("FRILLED SHARK", "4:40.3"))),
    ("4:44.57", A("swim", **DEEP, heroes=[hh("frilled", path=[[0, 2200, 540], [2.6, 900, 560]])], cam=CAM(1.0, 1.05), ov=ST_("A LONG, EEL-LIKE BODY", "4:45.0", "4:47.0"))),
    ("4:47.15", PH("frilled_head", zoom=(1.0, 1.2), origin="60% 60%", ov=ST_("AROUND 300 TRIDENT-SHAPED TEETH", "4:48.0", "4:51.9"))),
    ("4:52.01", A("swim", **DEEP, heroes=[hh("frilled", x=1100, y=540, len=2400)], cam=CAM(1.0, 1.2, x1=700, y1=40), ov=ST_("PREY ONLY GOES ONE WAY: DOWN", "4:54.3", "4:57.4"))),
    ("4:57.58", A("ice", heroes=[hh("green", path=[[0, -900, 640], [3.5, 300, 620]], fog=[20, 60, 70, 0.35])], cam=CAM(1.0, 1.04), ov=ST_("THE COLD WATERS OF THE FAR NORTH", "4:58.3", "5:00.9"))),
    ("5:01.06", V("yt:green_subc", 33, crop=(0.2, 0.22, 1.0, 1.0), ov=NM("GREENLAND SHARK", "5:01.3"))),
    ("5:03.02", V("yt:green_first", 208, ov=ST_("ONE OF THE SLOWEST SHARKS ON EARTH", "5:03.5", "5:05.9"))),
    ("5:06.06", S(years400, "5:07.0", "5:10.0")),
    ("5:16.26", V("yt:green_bait", 15)),
    ("5:19.68", A("ice", heroes=[hh("green", path=[[0, 2200, 650], [3.8, 1200, 600]], flip=True, fog=[20, 60, 70, 0.3])], cam=CAM(1.0, 1.06),
                  ov=ST_("WHOLE SEALS FOUND IN THEIR STOMACHS", "5:20.2", "5:23.4"))),
    ("5:23.58", V("yt:iceseal", 220, ov=ST_("SNEAKING UP ON SLEEPING SEALS?", "5:24.0", "5:27.0"))),
    ("5:27.23", V("yt:green_first", 236, ov=ST_("POLAR BEAR REMAINS: PROBABLY SCAVENGED", "5:28.0", "5:33.0"))),
    # ---------------- GIANTS
    ("5:33.22", A("unknown", hero=hh("gsquid", len=2000), eyeDx=-700, ov=TT("NOW THE GIANTS", "5:33.4", "5:35.2", size=160))),
    ("5:35.36", V("yt:gsquid_noaa", 13, ov=NM("GIANT SQUID", "5:35.6"))),
    ("5:37.09", S(eye_plate, "5:38.0")),
    ("5:39.60", A("swim", **BLACK, heroes=[hh("gsquid", path=[[0, -1200, 520], [4.2, 700, 540]])], lamp=[960, 540, 800], cam=CAM(1.0, 1.06),
                  ov=LB("TOOTHED SUCKERS", "5:41.0", 1300, 640))),
    ("5:43.79", A("swim", **BLACK, heroes=[hh("gsquid", x=960, y=540, sil=0.75, len=1900)], torch=[960, 540, 700, 0.5], cam=CAM(1.0, 1.04), ov=ST_("FOR CENTURIES, A LEGEND", "5:44.0", "5:45.9"))),
    ("5:45.99", S(world_pins, [(142.2, 27.1, "2012 · OFF JAPAN", "5:48.6"), (-88.5, 28.3, "2019 · GULF OF MEXICO", "5:53.2")], None, 1.0)),
    ("5:55.99", A("ejelly", **BLACK, jelly=[1300, 560], heroes=[hh("gsquid", path=[[0, -500, 520], [4.3, 650, 540]], fog=[10, 30, 50, 0.25])], cam=CAM(1.0, 1.06),
                  ov=ST_("LURED BY A FAKE GLOWING JELLYFISH", "5:56.6", "6:00.1"))),
    ("6:00.30", V("yt:sperm_dominica", 13, crop=DOMC, ov=ST_("THE TRUE KING OF THE DEEP", "6:01.5", "6:04.3"))),
    ("6:04.47", V("yt:sperm_dominica", 50, crop=DOMC, ov=NM("SPERM WHALE", "6:04.6"))),
    ("6:06.13", S(size_compare, [("diver_sil", 1.8, "DIVER", False), ("il_sperm", 16, "SPERM WHALE · UP TO ~16 M", False)], ["6:06.3", "6:06.8"], 19.0)),
    ("6:08.85", A("descend", d0=0.3, d1=0.9, rise=30, silhouette=hh("sperm", path=[[0, 1700, 200], [5, 500, 800]], angle=0.35, fog=[10, 40, 60, 0.35]),
                  ov=ST_("OVER 1 KM DOWN · OVER AN HOUR ON ONE BREATH", "6:09.6", "6:14.0"))),
    ("6:14.11", A("clicks", **BLACK, hero=hh("sperm", x=700, y=560, len=1500), head=[0.95, 0.35], c0=0.4, every=0.4, target=[1700, 600], cam=CAM(1.0, 1.06),
                  back=[hh("gsquid", x=1750, y=620, len=700, sil=0.6)], ov=both(ST_("THE LOUDEST SOUND OF ANY ANIMAL", "6:14.6", "6:17.5"), FX("sonar_ping", "6:14.5", 0.5), FX("sonar_ping", "6:17.8", 0.4)))),
    ("6:21.14", V("yt:sperm_dominica", 88, crop=DOMC, ov=ST_("CIRCULAR SUCKER SCARS", "6:24.0", "6:26.6"))),
    ("6:26.80", A("swim", **BLACK, heroes=[hh("sperm", x=900, y=520, len=1600, beat=0.8, amp=0.07, sil=0.3), hh("gsquid", x=1350, y=600, len=900, beat=1.2, amp=0.08, angle=0.5, sil=0.3)],
                  lamp=[1100, 560, 700], cam=CAM(1.0, 1.1, shake=[[0.6, 10, 2.2]]), ov=FX("thud", "6:27.6", 0.7))),
    # ---------------- STRANGER
    ("6:29.88", A("descend", d0=0.85, d1=1.0, rise=50, ov=DC("2,000 M"))),
    ("6:31.63", A("descend", d0=0.95, d1=1.0, rise=50, ov=DC("3,000 M", "NOW THE PREDATORS GET STRANGER", "6:33.02"))),
    ("6:35.64", V("yt:tunic_naut", 50)),
    ("6:38.52", V("yt:tunic_mbari", 64, crop=MBT, ov=NM("PREDATORY TUNICATE", "6:38.8"))),
    ("6:42.78", A("tunicate", **BLACK, floor=dict(y=820, light=[960, 900, 1]), hero=dict(img="img_tunicate", x=960, y=520, h=760), hood=0.42, tSnap="6:49.20", cam=CAM(1.0, 1.08),
                  ov=FX("thud", "6:49.20", 0.6))),
    ("6:50.81", V("yt:tunic_mbari", 101, crop=MBT, ov=ST_("A VENUS FLYTRAP OF THE DEEP SEA", "6:51.3", "6:54.3"))),
    ("6:54.53", V("yt:harp_mbari", 27, crop=HARP, ov=NM("HARP SPONGE", "6:54.8"))),
    ("6:56.84", V("yt:harp_four", 62, crop=(0.14, 0.0, 1.0, 0.86), ov=ST_("MOST SPONGES FILTER WATER. THIS ONE DOESN'T.", "6:57.4", "7:02.2"))),
    ("7:02.42", S(world_pins, [(-122.5, 36.4, "2012 · OFF CALIFORNIA · 3 KM+", "7:03.0")], (-122.5, 36.4), 3.0)),
    ("7:07.46", V("yt:harp_mbari", 118, crop=HARP, ov=ST_("BRANCHES COVERED IN TINY HOOKS", "7:08.6", "7:12.7"))),
    ("7:12.90", A("harp", **BLACK, floor=dict(y=860, light=[900, 1000, 1]), hero=dict(img="img_harp", x=860, y=520, h=820), cam=CAM(1.0, 1.1),
                  stick=[[1.5, 700, 260], [2.2, 820, 300], [2.9, 960, 380], [3.4, 1080, 470], [4.0, 600, 230], [4.6, 1150, 540]])),
    ("7:18.72", V("yt:harp_mbari", 136, crop=HARP, ov=ST_("A SPONGE THAT HUNTS", "7:18.9", "7:20.0"))),
    ("7:20.02", V("yt:tripod", 12, crop=(0.0, 0.08, 1.0, 0.86), ov=NM("TRIPOD FISH", "7:20.3"))),
    ("7:27.04", PH("tripod_photo", zoom=(1.0, 1.15), origin="55% 45%", ov=LB("FINS UP LIKE ANTENNAS", "7:28.6", 1080, 380))),
    ("7:34.26", V("yt:dumbo_naut", 39, ov=NM("DUMBO OCTOPUS", "7:34.5"))),
    ("7:38.38", V("yt:dumbo_4k", 76)),
    ("7:43.09", A("swim", depth=0.9, snow=200, floor=dict(y=840, light=[960, 900, 1]), heroes=[hh("dumbo", path=[[0, -400, 520], [6.9, 1300, 470]], shadowY=870)],
                  shrimp2=dict(n=6, cx=1200, cy=480, rx=120, ry=60, size=9, seed=41, suck=[4.8, 1150, 470, 300]), cam=CAM(1.0, 1.06),
                  ov=ST_("IT SWALLOWS ITS PREY WHOLE", "7:47.0", "7:49.9"))),
    # ---------------- HADAL / SNAILFISH
    ("7:50.03", A("descend", d0=0.95, d1=1.0, rise=60, ov=DC("6,000 M", "THE HADAL ZONE", "7:52.0"))),
    ("7:53.73", V("yt:snail_naut", 10)),
    ("7:59.10", V("yt:snail_caladan", 4, crop=(0.06, 0.18, 1.0, 1.0), ov=NM("SNAILFISH", "7:59.3"))),
    ("8:00.64", V("yt:snail_caladan", 14, crop=(0.06, 0.18, 1.0, 1.0), ov=ST_("PALE · SOFT · NO SCALES", "8:01.0", "8:04.6"))),
    ("8:04.86", V("yt:snail_deepest", 0, speed=0.34, crop=(0.0, 0.3, 0.62, 0.92), ov=ST_("FILMED AT 8,336 M", "8:07.8", "8:10.2", size=100))),
    ("8:10.44", A("swim", depth=0.95, snow=240, floor=dict(y=800, color=[80, 74, 60], light=[1000, 900, 1]), heroes=[hh("snail", path=[[0, 2100, 640], [7.8, 700, 620]], shadowY=820)],
                  shrimp=dict(n=60, cx=900, cy=640, rx=700, ry=200, size=9, seed=51, suck=[1.0, 1100, 630, 260]), cam=CAM(1.0, 1.06), ov=ST_("A TOP PREDATOR", "8:11.0", "8:13.8"))),
    ("8:18.31", V("yt:snail_caladan", 26, crop=(0.06, 0.18, 1.0, 1.0), ov=ST_("TOP OF THE FOOD CHAIN", "8:21.0", "8:24.0"))),
    # ---------------- RECAP AND END
    ("8:24.27", A("descend", d0=1.0, d1=1.0, rise=8, ov=ST_("A WORLD WITH ALMOST NOTHING TO EAT", "8:26.5", "8:29.2"))),
    ("8:29.38", S(recap_grid, ["swordfish", "humboldt2", "viper", "loosejaw2", "angler", "fangtooth", "swallower", "gulper", "goblin", "frilled",
                               "greenland", "giantsquid", "il_sperm", "tunicate", "dumbo"], "8:29.6", 0.2)),
    ("8:33.88", A("ultrablack", **BLACK, hero=hh("dragon", x=960, y=540, len=1100), lamp0=[700, 450], lamp1=[1300, 600], lampR=460, ov=ST_("LIGHT THAT HIDES", "8:34.0", "8:35.3", size=110))),
    ("8:35.42", A("lure", **BLACK, hero=hh("angler", x=1000, y=600), lure=[0.04, 0.27, 18, [120, 230, 255]], mouth=[0.06, 0.42], prey=[], cam=CAM(1.2, 1.3, x0=400, x1=450, y0=100, y1=120),
                  ov=ST_("LIGHT THAT LURES", "8:35.5", "8:37.2", size=110))),
    ("8:37.28", A("slingshot", **DEEP, hero=hh("goblin", x=1050, y=560, len=1700), jaw=[0.075, 0.56, 0.215, 0.98], tStrike="8:37.6", prey=[260, 610, 120],
                  ov=both(ST_("JAWS THAT LAUNCH", "8:37.35", "8:38.8", size=110), FX("thud", "8:37.6", 0.7)))),
    ("8:38.88", A("swallow", **DEEP, hero=hh("swallow", x=1000, y=470), prey=dict(img="img_lantern", len=900, x0=1300, headRight=False), belly=[0.55, 0.62], bellyR=0.21, tGulp="8:38.9",
                  ov=ST_("STOMACHS THAT STRETCH", "8:38.95", "8:40.5", size=110))),
    ("8:40.64", V("yt:harp_mbari", 100, crop=HARP, ov=ST_("SPONGES AND FLOWERS THAT HUNT", "8:40.8", "8:43.3", size=100))),
    ("8:43.52", V("yt:dumbo_4k", 120)),
    ("8:48.14", V("px_rays", 0)),
    ("8:52.89", V("yt:dragon_mbari", 15, crop=MBT, ov=ST_("NEW SPECIES FOUND EVERY YEAR", "8:53.5", "8:57.4"))),
    ("8:57.60", A("unknown", hero=hh("frilled", len=2200), eyeDx=-900, ov=ST_("PREDATORS NO HUMAN HAS EVER SEEN", "9:00.6", "9:04.0"))),
    ("9:04.22", A("unknown", hero=hh("goblin", len=2200), eyeDx=-1000, ov=lambda a, b: endcard(a, b, s("9:06.84")))),
]
SHOTS = [x for x in SHOTS if x[1] is not None]

CSS = open(H / "style.css", encoding="utf-8").read()
IMGS = {f"img_{n}": n for n in ["swordfish", "viper", "loosejaw2", "dragon", "angler", "fangtooth", "swallower", "swallower_full", "gulper", "goblin", "frilled", "greenland",
                                "giantsquid", "humboldt2", "dumbo", "lantern", "tunicate", "harp"]}
IMGS.update({"img_sperm": "il_sperm", "img_snail": "snailfish"})
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
<script src="assets/js/ocean.js"></script><script src="assets/js/deep.js"></script><script src="assets/js/sc.js"></script>
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
