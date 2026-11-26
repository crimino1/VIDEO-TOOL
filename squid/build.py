"""Why You'd Never Want To Meet A Colossal Squid (Unseen Kingdom). Builds the film in four parts, p1.html .. p4.html,
timed to the voice. 3D plates from blender/, real footage, Pexels stock and 2D scenes from scenes.py.
Usage: python build.py            writes all parts and sfx.json"""
import json, sys
from lib import *
from scenes import *

END = 1205.40
PARTS = [round(x * 30) / 30 for x in (0.0, s("4:48.15"), s("9:47.22"), s("14:30.38"), END)]  # frame-exact so the joined parts stay in sync

SOI = (0.0, 0.0, 0.86, 0.86)      # crop that drops the Schmidt Ocean bug at lower right
BIO = (0.08, 0.1, 0.92, 0.94)     # crop that drops the corner marks on the bioluminescence reel
TOOTH = (0.0, 0.0, 1.0, 0.80)     # drop burned-in captions on the longline film
COOL = "eq=saturation=0.9:contrast=1.04,colorbalance=bs=0.06:bm=0.03"


def V(src, ss=0, speed=1.0, ov=None, **kw):
    def f(a, b):
        video(a, b, src, ss, speed, **kw)
        if ov: layer(a, b, ov(a, b))
    return f


def S(fn, *args, **kw):
    return lambda a, b: layer(a, b, fn(a, b, *args, **kw))


def PH(name, ov=None, **kw):
    return lambda a, b: layer(a, b, photo(a, b, name, **kw) + (ov(a, b) if ov else ""))


def CH(text, sub=None):
    """Chapter title over a shot, with a deep boom."""
    def f(a, b):
        sfx("deep_boom", a + 0.1, 0.9)
        return dim(0.35) + title(text, a + 0.2, min(b, a + 4.6), sub=sub, sub_t=a + 1.4)
    return f


def both(*fs):
    return lambda a, b: "".join(f(a, b) for f in fs)


def ST_(text, t, end=None, **kw):
    return lambda a, b: stamp(text, t, end, **kw)


def LB(text, t, x, y, **kw):
    return lambda a, b: label(text, t, x, y, **kw)


def CR(text):
    return lambda a, b: credit(text)


def FX(name, t, vol=1.0):
    def f(a, b):
        sfx(name, t, vol)
        return ""
    return f


SOI_CR = CR("Footage: Schmidt Ocean Institute")
NOAA_CR = CR("Footage: NOAA Ocean Exploration")
TEPAPA_CR = CR("Footage: Museum of New Zealand Te Papa Tongarewa")
NAUT_CR = CR("Footage: Ocean Exploration Trust / Nautilus Live")

SHOTS = [
    # ---------------- HOOK
    ("0:00.00", V("p:descent", 12, ov=both(lambda a, b: depth_open(a, b), FX("deep_boom", 0.2, 0.6)))),
    ("0:04.48", V("px_snow_0", 5, zoom=(1.0, 1.08))),
    ("0:09.94", V("p:hover", 0, dark=0.12, zoom=(1.0, 1.1), ov=FX("drone_swell", "0:06.5", 0.5))),
    ("0:14.20", V("p:eye_reveal", 0, zoom=(1.0, 1.04), ov=both(ST_("THE SIZE OF A DINNER PLATE", "0:18.69", "0:20.90"), ST_("THE BIGGEST EYE OF ANY ANIMAL ALIVE", "0:21.05"), FX("glow_shimmer", "0:16.2", 0.5)))),
    ("0:25.34", S(eye_compare, False, times=[s("0:25.40"), s("0:25.75")])),
    ("0:26.82", S(dino)),
    ("0:31.98", V("p:eye_reveal", 11.2, zoom=(1.04, 1.12))),
    ("0:34.20", V("p:hover", 2, ov=ST_("HEAVIER THAN A GRAND PIANO", "0:36.70"))),
    ("0:39.92", V("p:hooks", 0, ov=both(LB("HOOKS", "0:41.10", 300, 200), ST_("THEY SWIVEL", "0:43.32"), FX("water_whoosh", "0:39.92", 0.5)))),
    ("0:45.62", V("p:beak", 0, ov=both(LB("BEAK", "0:47.80", 1010, 470), FX("hull_groan", "0:48.0", 0.3)))),
    ("0:52.14", V("p:swim", 1, ov=both(lambda a, b: title("THE COLOSSAL SQUID", a + 0.4, a + 3.3, y=360, size=170, sub="Mesonychoteuthis hamiltoni", sub_t=a + 1.0),
                                         ST_("THE HEAVIEST INVERTEBRATE ON EARTH", "0:55.30"), FX("deep_boom", "0:52.2", 1.0)))),
    ("0:57.60", V("yt:nautilus_sperm", 20, ov=both(NAUT_CR, ST_("NEVER SEEN ALIVE AS A FULL-GROWN ADULT", "0:59.70")))),
    ("1:04.46", S(fragments, "1:07.52", "1:09.88", "1:12.35", "1:15.91")),
    ("1:20.43", V("p:descent", 0, ov=FX("bubbles", "1:20.6", 0.6))),
    # ---------------- WHERE IT LIVES
    ("1:24.37", V("p:sub_dark", 2, ov=CH("THE DARK", "WHERE IT LIVES"))),
    ("1:30.92", S(southmap, "overview")),
    ("1:33.55", V("px_storm_3", 2, grade=COOL)),
    ("1:36.65", V("pin_ice1", 1)),
    ("1:39.67", V("px_antarctica_3", 2)),
    ("1:41.29", V("px_albatross_0", 1)),
    ("1:43.65", V("px_storm_0", 3, grade=COOL)),
    ("1:45.22", V("p:descent", 0, zoom=(1.0, 1.0), ov=both(lambda a, b: light_fade(a, b, "1:50.22", "1:51.44", "1:52.68", "1:58.64", "2:01.33"), FX("bubbles", "1:45.4", 0.5)))),
    ("2:04.31", V("px_snow_2", 10, zoom=(1.0, 1.1))),
    ("2:09.37", S(zones, "adult", t_band=s("2:10.76"))),
    ("2:19.59", S(thermo, "2:26.17")),
    ("2:29.33", S(pressure, "2:31.00", "2:39.10", "2:41.98", "2:45.14")),
    ("2:48.83", V("p:sub_lights", 0, ov=FX("hull_creak", "2:53.09", 0.8))),
    ("2:55.97", V("p:sub_dark", 0, ov=FX("hull_groan", "2:56.6", 0.4))),
    ("3:01.72", V("px_snow_3", 3)),
    ("3:04.19", V("p:sub_dark", 9, zoom=(1.05, 1.12), ov=FX("glow_shimmer", "3:05.5", 0.5))),
    ("3:09.82", V("pin_deep", 4)),
    ("3:13.46", V("yt:noaa_biolum", 118, crop=BIO, ov=both(ST_("BIOLUMINESCENCE", "3:13.70"), CR("Footage: NOAA / E. Widder")))),
    ("3:17.32", V("p:eye_reveal", 4, zoom=(1.0, 1.08))),
    # ---------------- 2007
    ("3:21.10", S(southmap, "ross", t_pin=s("3:26.40"), pin_text="ROSS SEA", extra="")),
    ("3:28.69", V("yt:austral_tooth", 172, crop=TOOTH, ov=CR("Footage: Austral Fisheries"))),
    ("3:32.76", PH("tooth_noaa", ov=both(LB("ANTARCTIC TOOTHFISH", "3:33.3", 140, 120), CR("NOAA · public domain")), mode="card")),
    ("3:38.03", S(longline, "3:42.39")),
    ("3:49.57", V("px_boat_0", 2, grade=COOL)),
    ("3:51.11", V("yt:tepapa_exam", 40, ov=TEPAPA_CR)),
    ("3:54.10", S(weight, "3:56.92", "3:59.62", "4:01.48")),
    ("4:04.77", V("yt:tepapa_exam", 225, ov=TEPAPA_CR)),
    ("4:08.25", V("p:eye_reveal", 6, zoom=(1.06, 1.14))),
    ("4:10.46", V("yt:tepapa_oil", 78, ov=TEPAPA_CR)),
    ("4:14.23", S(eye27, "4:17.91", "4:22.22")),
    ("4:26.79", S(eye_compare, True, times=[s("4:28.13"), s("4:31.42"), s("4:38.56")])),
    ("4:41.58", V("p:hover", 8, dark=0.12)),
    ("4:44.08", V("p:eye_reveal", 8, zoom=(1.0, 1.1))),
    # ---------------- THE EYE
    ("4:48.15", V("px_snow_1", 5, ov=CH("THE EYE"))),
    ("4:50.73", S(graph2012, "4:51.55", "4:56.93", "5:02.91", "5:10.76")),
    ("5:14.24", V("p:glow_wake", 0, 0.8, ov=FX("glow_shimmer", "5:26.9", 0.6))),
    ("5:26.88", V("p:glow_wake", 9, 0.8, zoom=(1.08, 1.0))),
    ("5:34.94", S(range100)),
    ("5:39.94", V("p:whale_dive", 2, dark=0.1, ov=FX("drone_swell", "5:38.0", 0.5))),
    ("5:46.04", V("px_whale_0", 5, ov=both(lambda a, b: title("SPERM WHALE", a + 0.2, b - 0.2, y=760, size=140), FX("deep_boom", "5:46.1", 0.7)))),
    ("5:51.64", V("yt:nautilus_sperm", 78, ov=both(NAUT_CR, ST_("AN EARLY WARNING SYSTEM", "5:52.54")))),
    ("5:57.84", V("p:sub_lights", 4)),
    ("6:02.99", V("p:sub_dark", 12, ov=FX("glow_shimmer", "6:04.81", 0.5))),
    ("6:07.46", V("p:glow_wake", 4, zoom=(1.12, 1.02), ov=ST_("TO THAT EYE, YOU LOOK LIKE A PREDATOR", "6:08.52"))),
    ("6:14.60", V("p:hover", 10, zoom=(1.0, 1.18), ov=FX("drone_swell", "6:11.0", 0.6))),
    # ---------------- THE BODY
    ("6:17.60", V("p:swim", 6, ov=both(CH("THE BODY"), LB("MANTLE", "6:23.10", 980, 380)))),
    ("6:25.24", S(size_human)),
    ("6:32.24", V("p:swim", 11, zoom=(1.1, 1.0))),
    ("6:36.86", V("yt:noaa_giant", 5, crop=(0.0, 0.05, 1.0, 0.85), ov=both(LB("GIANT SQUID", "6:37.1", 1000, 300), CR("Footage: NOAA Ocean Exploration / E. Widder, N. Robinson")))),
    ("6:39.06", S(giant_vs, "6:40.87", "6:48.54", "6:50.62", "6:52.26")),
    ("6:56.10", V("yt:tepapa_exam", 315, ov=both(TEPAPA_CR, ST_("POUND FOR POUND, NOTHING COMES CLOSE", "6:56.80")))),
    ("7:00.78", S(arms_count, "7:04.16")),
    ("7:10.97", V("yt:noaa_red", 10, ov=both(LB("MOST SQUID", "7:11.3", 200, 200), NOAA_CR))),
    ("7:14.80", S(sucker_vs_hook, "7:17.31")),
    ("7:19.89", V("p:hooks", 4, 0.8, ov=both(ST_("ROWS OF CURVED HOOKS", "7:28.00"), FX("water_whoosh", "7:20.0", 0.4)))),
    ("7:28.61", S(swivel, "7:31.75", "7:38.00", "7:43.48", "7:46.50")),
    ("7:50.77", V("p:strike", 1, ov=FX("strike", "7:52.0", 0.9))),
    ("7:55.87", V("px_sperm_0", 4)),
    ("8:01.60", S(scars, "8:09.34")),
    ("8:13.58", V("px_whale_0", 20)),
    ("8:16.13", V("p:battle", 0, ov=FX("drone_swell", "8:14.0", 0.6))),
    ("8:21.80", V("p:sub_dark", 14, ov=FX("hull_creak", "8:24.0", 0.7))),
    ("8:26.24", V("p:strike", 2.5, ov=FX("strike", "8:26.8", 0.9))),
    ("8:29.38", V("px_diver_1", 3)),
    # ---------------- THE BEAK
    ("8:33.12", V("p:hooks", 8)),
    ("8:37.94", V("p:beak", 0, 0.95, ov=both(LB("THE MOUTH", "8:43.98", 1010, 470), FX("deep_boom", "8:38.0", 0.6)))),
    ("8:48.44", S(beak_parrot, "8:54.96")),
    ("9:01.05", PH("beak_mh", ov=both(ST_("THE LARGEST BEAK OF ANY KNOWN SQUID", "9:01.40", y=880), CR("Colossal squid beak · Wikimedia Commons, CC BY-SA 3.0")), mode="card")),
    ("9:05.76", V("p:beak", 3, zoom=(1.08, 1.16))),
    ("9:12.74", V("p:hover", 14, dark=0.08)),
    ("9:17.81", V("px_octopus_1", 3)),
    ("9:20.29", S(brain, "9:20.80", "9:27.00", "9:36.44", "9:40.73")),
    ("9:47.22", V("p:hover", 4)),
    ("9:54.54", V("p:swim", 3, flip=True)),
    ("10:01.13", lambda a, b: (layer(a, b, hearts(a, b, "10:02.81", "10:04.85")), [sfx("heartbeat", a + 1.7 + k * 0.9, 0.5) for k in range(6)])),
    ("10:08.72", S(blood, "10:10.68", "10:12.14", "10:16.18", "10:20.48")),
    ("10:27.42", S(recap, [s("10:27.42"), s("10:28.93"), s("10:30.29"), s("10:33.15")])),
    ("10:35.36", V("p:eye_reveal", 2, zoom=(1.0, 1.1))),
    # ---------------- THE HUNT
    ("10:40.96", V("p:swim", 0, 1.5, ov=CH("THE HUNT"))),
    ("10:46.96", V("p:swim", 4, 1.5, flip=True, ov=FX("water_whoosh", "10:47.0", 0.6))),
    ("10:54.00", V("p:hover", 6, dark=0.12, zoom=(1.0, 1.12))),
    ("10:59.91", S(metab_a, "11:12.47")),
    ("11:20.83", S(metab_b, "11:25.13", "11:31.13")),
    ("11:35.19", V("p:hover", 0, zoom=(1.0, 1.14))),
    ("11:45.86", V("p:eye_reveal", 10, zoom=(1.0, 1.08))),
    ("11:51.52", V("p:hover", 13, zoom=(1.05, 1.15), ov=FX("drone_swell", "11:49.0", 0.6))),
    ("11:57.87", V("p:strike", 0, ov=FX("strike", "11:59.44", 1.0))),
    ("12:03.24", V("p:beak", 5)),
    ("12:09.01", V("p:sub_dark", 2, ov=FX("hull_creak", "12:11.5", 0.6))),
    ("12:17.22", lambda a, b: (video(a, s("12:20.82"), "px_snow_0", 70), video(s("12:20.82"), b, "p:eye_reveal", 12, zoom=(1.15, 1.05)),
                               layer(a, b, porthole_frame(a, b, s("12:20.82")) + "", "top"), sfx("deep_boom", s("12:20.85"), 1.0))),
    # ---------------- THE HUNTER
    ("12:23.28", V("p:hover", 12, dark=0.1)),
    ("12:30.55", V("p:whale_dive", 0, ov=CH("THE HUNTER"))),
    ("12:37.60", PH("whaling1", ov=both(lambda a, b: title("1925", a + 0.3, b, y=400, size=200), CR("Whaling station, about 1915 · public domain")), mode="card")),
    ("12:44.06", PH("whaling2", mode="card", ov=CR("Cutting in a sperm whale · public domain"))),
    ("12:49.88", PH("whaling4", mode="card", zoom=(1.08, 1.0), ov=CR("Archive photo, 1921 · public domain"))),
    ("12:54.38", V("p:hooks", 2)),
    ("12:58.33", S(robson, "13:03.21")),
    ("13:08.51", V("yt:nautilus_sperm", 30, ov=NAUT_CR)),
    ("13:13.19", V("px_whale_0", 12, ov=ST_("DISCOVERED AS LEFTOVERS", "13:13.80"))),
    ("13:18.68", PH("whaling3", mode="card", zoom=(1.1, 1.0), origin="30% 40%", ov=CR("Whaling station, about 1915 · public domain"))),
    ("13:22.72", S(beaks_stomach, "13:30.98", "13:34.98")),
    ("13:39.10", S(beak_measure, "13:44.72", "13:47.39")),
    ("13:53.46", V("p:hover", 2, dark=0.1)),
    ("14:00.19", V("p:whale_dive", 6)),
    ("14:03.67", V("px_sperm_1", 2, ov=FX("bubbles", "14:06.0", 0.5))),
    ("14:07.41", V("p:whale_dive", 3, ov=both(ST_("1 KM", "14:10.13", "14:11.40", size=100), ST_("2 KM", "14:11.48", "14:12.80", size=100), ST_("MORE THAN AN HOUR ON ONE BREATH", "14:12.92")))),
    ("14:15.80", S(sonar, "14:18.44", "14:23.88")),
    # ---------------- (part 4) the meeting
    ("14:30.38", V("p:hover", 5, dark=0.1)),
    ("14:34.80", V("p:eye_reveal", 12)),
    ("14:39.45", V("p:glow_wake", 2, 0.9, ov=FX("glow_shimmer", "14:44.0", 0.6))),
    ("14:51.30", V("p:eye_reveal", 13, zoom=(1.08, 1.2), ov=FX("deep_boom", "14:51.4", 0.6))),
    ("14:54.34", V("p:swim", 8, 1.5, ov=FX("water_whoosh", "14:54.6", 0.6))),
    ("14:58.03", V("p:hover", 17, dark=0.15)),
    ("14:59.65", V("p:battle", 0, ov=both(FX("drone_swell", "14:57.6", 0.8), FX("strike", "15:03.1", 0.8), FX("hull_groan", "15:08.0", 0.5)))),
    ("15:13.89", V("p:battle", 6, 0.7)),
    ("15:16.38", PH("scars_skin", ov=CR("Sperm whale skin with squid sucker scars · Wikimedia Commons, public domain"), mode="card", crop=(0.0, 0.08, 1.0, 0.8))),
    ("15:24.17", V("yt:nautilus_sperm", 80, ov=NAUT_CR)),
    ("15:26.96", V("p:battle", 10, ov=FX("deep_boom", "15:27.48", 0.8))),
    ("15:28.64", V("px_snow_2", 30)),
    ("15:35.74", S(southmap, "range")),
    # ---------------- 2025
    ("15:43.90", V("px_snow_1", 20)),
    ("15:47.82", PH("sq_nz07", mode="card")),
    ("15:51.14", V("yt:noaa_sq1", 18, ov=NOAA_CR)),
    ("15:57.76", V("yt:nautilus_sperm", 25, ov=NAUT_CR)),
    ("16:01.14", V("px_dark_1", 2)),
    ("16:06.08", S(southmap, "ssi", t_pin=s("16:13.33"), pin_text="SOUTH SANDWICH ISLANDS", extra="")),
    ("16:19.31", V("yt:noaa_sq1", 20, ov=NOAA_CR)),
    ("16:26.76", V("yt:soi", 2, crop=SOI, ov=SOI_CR)),
    ("16:35.44", V("yt:soi", 20, crop=SOI, ov=SOI_CR)),
    ("16:42.97", V("yt:soi", 40, crop=SOI, ov=both(SOI_CR, lambda a, b: title("JUVENILE COLOSSAL SQUID", a + 0.3, b - 0.2, y=730, size=120, sub="FIRST FOOTAGE ALIVE · MARCH 2025", sub_t=a + 1.2)))),
    ("16:52.22", V("yt:soi", 62, crop=SOI, ov=SOI_CR)),
    ("17:02.08", V("p:hover", 3)),
    ("17:05.28", S(zones, "juvenile")),
    ("17:16.73", V("yt:soi", 80, crop=SOI, ov=SOI_CR)),
    ("17:21.15", V("p:battle", 4)),
    ("17:22.75", V("p:eye_reveal", 9)),
    ("17:26.88", V("yt:soi", 86, crop=SOI, ov=SOI_CR)),
    # ---------------- WHAT WE DON'T KNOW
    ("17:30.12", V("px_snow_3", 5)),
    ("17:32.56", V("yt:soi", 50, crop=SOI, ov=SOI_CR)),
    ("17:34.42", V("yt:tepapa_exam", 400, ov=TEPAPA_CR)),
    ("17:39.60", V("p:hover", 9, dark=0.1)),
    ("17:48.13", V("p:hover", 14, 0.5, dark=0.15, ov=lambda a, b: unknowns(a, b, [s("17:48.40"), s("17:57.57"), s("17:59.67"), s("18:03.93")]))),
    ("18:06.66", V("px_storm_2", 4, grade=COOL)),
    ("18:10.05", V("p:sub_lights", 2)),
    ("18:13.97", V("px_fog_0", 2)),
    ("18:18.53", S(mars, "18:22.10")),
    # ---------------- BACK TO THE START
    ("18:24.27", V("p:descent", 15)),
    ("18:27.38", V("p:sub_dark", 0, ov=FX("hull_creak", "18:31.96", 0.8))),
    ("18:33.66", V("p:sub_dark", 7, zoom=(1.08, 1.16))),
    ("18:36.54", V("px_snow_0", 50)),
    ("18:38.92", V("p:eye_reveal", 0, ov=FX("drone_swell", "18:37.0", 0.6))),
    ("18:45.33", V("p:eye_reveal", 9, zoom=(1.1, 1.2))),
    ("18:48.63", V("p:hover", 1, ov=ST_("AS HEAVY AS A SMALL CAR", "18:49.51"))),
    ("18:51.22", V("p:hooks", 3)),
    ("18:55.20", V("p:hover", 6, 0.6)),
    ("19:00.26", V("p:sub_dark", 11)),
    ("19:06.87", V("p:glow_wake", 5)),
    ("19:13.46", V("p:whale_dive", 8)),
    ("19:19.66", V("p:glow_wake", 10)),
    ("19:23.06", V("p:battle", 11)),
    ("19:24.78", V("yt:soi", 70, crop=SOI, ov=SOI_CR)),
    ("19:28.58", V("px_iceberg_1", 3)),
    ("19:34.84", V("p:sub_dark", 15)),
    ("19:38.13", V("px_snow_1", 40)),
    ("19:43.56", V("p:eye_reveal", 4)),
    ("19:48.52", V("p:hover", 11)),
    ("19:50.59", V("p:strike", 0, ov=FX("strike", "19:51.3", 1.0))),
    ("19:53.23", lambda a, b: (video(a, b, "p:eye_reveal", 3, dark=0.2, zoom=(1.0, 1.08)), layer(a, b, endcard(a, b, s("19:57.55"))))),
]

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"League Gothic",sans-serif;color:#f2f6f8}
.scene{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.vw{position:absolute;overflow:hidden}
.fit{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
.fill{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}
.full{position:absolute;left:0;top:0;width:1920px;height:1080px}
.bg2{position:absolute;inset:0}
.snow{position:absolute;left:-140px;top:-160px;width:2200px;height:1400px}
.black{position:absolute;inset:0;background:#000}
.dim{position:absolute;inset:0;background:#000}
.row{position:absolute}
.stamp{display:inline-block;font-family:"League Gothic";color:#fff;letter-spacing:1px;-webkit-text-stroke:7px #000;paint-order:stroke fill;text-shadow:0 0 30px rgba(0,0,0,.8);opacity:0;white-space:nowrap}
.stamp2{position:absolute;font-family:"League Gothic";font-size:74px;color:#ffb39e;text-align:left}
.label{position:absolute;display:flex;align-items:center;gap:16px;font-family:"League Gothic";color:#fff;-webkit-text-stroke:6px #000;paint-order:stroke fill;opacity:0;white-space:nowrap}
.label .tri{display:block;width:0;height:0;border-top:22px solid transparent;border-bottom:22px solid transparent}
.label.left .tri{border-right:34px solid #e0322b}
.label.right .tri{border-left:34px solid #e0322b}
.chap{position:absolute;left:0;right:0;text-align:center;font-family:"League Gothic";color:#fff;line-height:1;text-shadow:0 0 50px rgba(0,0,0,.95),0 0 18px rgba(0,0,0,.9);opacity:0}
.chapsub{position:absolute;left:0;right:0;text-align:center;font-family:"League Gothic";font-size:58px;letter-spacing:6px;color:#d6e2e8;text-shadow:0 0 30px rgba(0,0,0,.95);opacity:0}
.big{position:absolute;left:0;right:0;text-align:center;font-family:"League Gothic";font-size:230px;line-height:1;color:#fff;text-shadow:0 0 40px rgba(0,0,0,.8)}
.bigsub{position:absolute;left:0;right:0;text-align:center;font-family:"League Gothic";font-size:66px;letter-spacing:3px;color:#c9d6dc}
.latin{position:absolute;left:0;right:0;text-align:center;font-family:"EB Garamond";font-style:italic;font-size:150px;color:#f4e6cf}
.credit{position:absolute;left:40px;bottom:30px;font-family:"EB Garamond";font-size:30px;color:rgba(255,255,255,.85);text-shadow:0 1px 6px rgba(0,0,0,.9)}
.card{position:absolute;overflow:hidden;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.8),0 0 0 2px rgba(255,255,255,.12)}
.card img{display:block}
.fcard{position:absolute;background:#0e161b;border-radius:10px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.8),0 0 0 2px rgba(255,255,255,.14)}
.fcard img{display:block}
.fcap{font-family:"League Gothic";font-size:40px;letter-spacing:1px;color:#f2f6f8;padding:12px 18px;text-align:center}
.spectrum{position:absolute;left:70px;top:250px}
.band{display:flex;align-items:center;gap:18px;margin-bottom:22px;opacity:0}
.band i{display:block;width:90px;height:44px;border-radius:6px}
.band span{font-family:"League Gothic";font-size:52px;color:#fff;-webkit-text-stroke:5px #000;paint-order:stroke fill}
.depthbox{position:absolute;right:80px;top:80px;text-align:right}
.dl{font-family:"Inter";font-weight:700;font-size:30px;letter-spacing:4px;color:#c9d6dc}
.dv{font-family:"League Gothic";font-size:120px;color:#fff;-webkit-text-stroke:6px #000;paint-order:stroke fill;opacity:0}
.recap{position:absolute;left:0;right:0;text-align:center;font-family:"League Gothic";font-size:120px;color:#fff;text-shadow:0 0 30px rgba(0,0,0,.9)}
.subbtn{position:absolute;left:760px;top:640px;width:400px;height:110px;line-height:110px;border-radius:14px;background:#e0322b;text-align:center;font-family:"League Gothic";font-size:72px;letter-spacing:3px;color:#fff;box-shadow:0 18px 50px rgba(0,0,0,.7)}
.top{z-index:5000 !important}
"""


def write_part(k):
    p0, p1 = PARTS[k], PARTS[k + 1]
    html.clear(); tl.clear()
    ST.update(off=p0, n=10)
    for i, (st, fn) in enumerate(SHOTS):
        a = s(st); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        ST["skip"] = not (p0 - 0.05 <= a < p1 - 0.05)
        if abs(a - p0) < 0.05: a = p0   # first shot of a part starts exactly on the part's first frame
        fn(a, b)
    ST["skip"] = False
    dur = p1 - p0
    doc = f'''<!doctype html>
<html>
<head>
<meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>{CSS}</style>
</head>
<body>
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
</body>
</html>
'''
    (H / "parts" / f"p{k + 1}.html").write_text(doc, encoding="utf-8")
    print(f"p{k + 1}.html  {p0:.2f}-{p1:.2f}  {len(html)} layers, {len(tl)} tweens")


if __name__ == "__main__":
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(4)
    sfx_cues.clear()
    for k in ks: write_part(k)
    if len(ks) == 4:
        json.dump(sorted(sfx_cues), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        print(len(sfx_cues), "sound cues")
