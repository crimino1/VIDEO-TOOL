"""What Would Happen If You Fell Into The Mariana Trench (Unseen By Eye). Writes parts/p1..p4.html, sfx.json and usage.json.
The voice is assets/vo.wav: the narration with the word "Kingdom" cut out (0.553 s at 15:26.40)."""
import json, sys, os, re, glob
from lib import *
from scenes2d import tiles
from scenes_t import *

END = 933.79
PARTS = [round(x * 30) / 30 for x in (0.0, s("4:17.67"), s("8:02.74"), s("12:10.13"), END)]
ROT = {}


def pick(src):
    if not src.startswith("px_") or re.search(r"_\d+$", src): return src
    opts = sorted(glob.glob(str(H / "assets" / "raw" / (src + "_*.mp4"))))
    if not opts: return src + "_0"
    k = ROT.get(src, 0); ROT[src] = k + 1
    return Path(opts[k % len(opts)]).stem


CREDIT = {"tripod": "Footage: Serpent Project", "mudmon": "Footage: NOAA Ocean Exploration", "angler_pair": "Footage: Kirchgessner / Rebikoff-Niggeler Foundation", "angler_gfoe": "Footage: NOAA / GFOE",
          "angler_noaa": "Footage: NOAA Ocean Exploration", "fang_noc": "Footage: National Oceanography Centre", "fang_mbari": "Footage: MBARI", "vampire": "Footage: Ocean Exploration Trust / Nautilus Live",
          "barreleye": "Footage: MBARI", "barreleye4k": "Footage: MBARI", "hatchet": "Footage: NOAA / GFOE", "snail_caladan": "Footage: Caladan Oceanic / Inkfish",
          "snail_deepest": "Footage: University of Western Australia / New Scientist", "snail_naut": "Footage: Ocean Exploration Trust / Nautilus Live", "amphi_super": "Footage: Caladan Oceanic",
          "amphi_bait": "Footage: Caladan Oceanic", "soi_deep": "Footage: Schmidt Ocean Institute", "caladan6600": "Footage: Caladan Oceanic", "seacuc": "Footage: NOAA Ocean Exploration",
          "seacuc2": "Footage: NOAA / GFOE", "brittle": "Footage: Oregon State University / NOAA", "brittle2": "Footage: NOAA PMEL", "trieste_cp": "Archive footage: US Navy via CriticalPast",
          "trieste_mt": "Archive footage: AP", "cameron_view": "Footage: Deepsea Challenge / National Geographic", "cameron_first": "Footage: Deepsea Challenge / National Geographic",
          "cameron_sub": "Footage: Deepsea Challenge", "vescovo_cnet": "Footage: Caladan Oceanic via CNET", "vescovo_bbc": "Footage: Caladan Oceanic via BBC News", "snow_mbari": "Footage: MBARI",
          "snow_noaa": "Footage: NOAA", "tuna": "Footage: Animals wildlife", "tuna2": "Footage: Al & Auds", "dvm": "Footage: Ocean Exploration Trust / Nautilus Live"}


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
def LB(text, t, x, y, **kw): return lambda a, b: label(text, t, x, y, **kw)
def CR(text): return lambda a, b: credit(text)
def HUD(*keys): return lambda a, b: depth_hud(a, b, list(keys))
def FX(name, t, vol=1.0):
    def f(a, b):
        sfx(name, t, vol); return ""
    return f
def CH(text, sub=None):
    def f(a, b):
        sfx("deep_boom", a + 0.1, 0.7)
        return dim(0.3) + title(text, a + 0.2, min(b, a + 4.2), sub=sub, sub_t=a + 1.2)
    return f
def TT(text, t, end=None, y=380, size=150, sub=None):
    return lambda a, b: title(text, t, end or b - 0.1, y=y, size=size, sub=sub, sub_t=s(t) + 1.0)


SHOTS = [
    # ---------------- ON THE SURFACE
    ("0:00.02", V("px_surface_2", 0, ov=lambda a, b: fade_in_black(a, 1.5))),
    ("0:02.94", S(pacific_map, "0:04.40")),
    ("0:06.69", V("px_waves_2", 0)),
    ("0:09.77", V("px_float_1", 0)),
    ("0:13.02", V("px_surface_0", 2)),
    ("0:15.58", A("surface", ov=ST_("BENEATH YOU: THE DEEPEST PLACE ON EARTH", "0:17.50"))),
    ("0:21.38", A("fall", d0=0.2, d1=0.45, rise=10, ov=FX("drone_swell", "0:20.4", 0.5))),
    ("0:24.24", S(trench_section, "0:27.94", "0:33.91", "0:36.87")),
    ("0:24.24", None),
    ("0:40.31", S(moon_vs, "0:42.21")),
    ("0:50.84", V("px_freedive_0", 2, ov=ST_("IN REAL LIFE, YOU WOULDN'T SURVIVE", "0:52.44"))),
    ("0:57.77", A("surface", ov=both(ST_("ONE IMPOSSIBLE THING: A SUIT THAT LETS YOU BREATHE", "1:00.64", "1:03.70"), ST_("EVERYTHING ELSE IS REAL", "1:05.30")))),
    ("1:09.82", A("surface", tLet="1:11.23", ov=both(ST_("LET GO", "1:11.30", size=110), FX("breath", "1:09.85", 0.9), FX("bubbles", "1:11.6", 0.5)))),
    # ---------------- SUNLIGHT ZONE
    ("1:12.45", A("fall", d0=0.04, d1=0.1, surface=[60, -320], rise=6, ov=HUD(("1:12.45", 0), ("1:25.0", 120)))),
    ("1:26.13", V("px_rays_1", 0, ov=CH("THE SUNLIGHT ZONE", "THE TOP 200 METRES"))),
    ("1:30.97", V("px_blue_2", 0, ov=ST_("ALMOST ALL THE LIFE YOU'VE EVER SEEN", "1:31.20"))),
    ("1:35.06", V("yt:tuna2", 10, crop=(0.1, 0.0, 0.9, 0.8), ov=LB("TUNA", "1:35.40", 300, 220))),
    ("1:40.60", V("px_shark_0", 16)),
    ("1:45.86", A("fall", d0=0.1, d1=0.16, rise=8, img="img_head", h=600, rot=0.2, ov=HUD(("1:45.86", 0), ("1:49.31", 10)))),
    ("1:51.35", S(lungs, "1:55.15", "1:59.19")),
    ("2:04.13", S(body_water, "2:13.19", ["2:16.23", "2:17.43", "2:18.63"])),
    ("2:19.15", A("fall", d0=0.16, d1=0.3, rise=9, ov=both(HUD(("2:19.15", 30), ("2:24.25", 100), ("2:29.0", 180)), ST_("THE REDS AND ORANGES ARE GONE", "2:25.69")))),
    ("2:29.61", A("fall", d0=0.3, d1=0.4, rise=9, img="img_head", h=620, rot=-0.15, spin=0.2, ov=HUD(("2:29.61", 180), ("2:31.4", 200)))),
    # ---------------- TWILIGHT ZONE
    ("2:31.58", A("fall", d0=0.4, d1=0.5, rise=9, ov=both(CH("THE TWILIGHT ZONE", "200 TO 1,000 METRES"), HUD(("2:31.58", 200), ("2:43.0", 350))))),
    ("2:43.79", A("ascent", d0=0.5, d1=0.48, ov=ST_("THE SURFACE: A FAINT, DISTANT SKY", "2:45.41"))),
    ("2:48.15", A("fall", d0=0.55, d1=0.6, rise=6, img="img_head", h=560, x=1250, school={"glow": 1, "n": 260, "t0": 0, "dur": 9, "y": 520, "h": 700}, ov=both(ST_("MAYBE MORE FISH THAN THE REST OF THE OCEAN", "2:48.99", "2:54.9"), LB("LANTERNFISH", "2:55.13", 300, 220)))),
    ("2:58.23", V("px_deepfish_2", 0, ov=both(LB("BRISTLEMOUTHS", "2:58.30", 300, 220), ST_("TRILLIONS OF THEM", "3:04.57")))),
    ("3:07.85", A("migration", ov=ST_("THE LARGEST MIGRATION ON EARTH", "3:24.54"))),
    ("3:31.67", A("fall", d0=0.5, d1=0.58, rise=8, img="img_head", h=640, rot=0.1, ov=HUD(("3:31.67", 450), ("3:34.37", 500)))),
    ("3:36.99", V("yt:hatchet", 16, ov=both(LB("HATCHETFISH", "3:37.20", 300, 220), ST_("CAMOUFLAGE MADE OF LIGHT", "3:50.17")))),
    ("3:53.26", V("yt:barreleye4k", 15, crop=(0.0, 0.1, 0.88, 1.0), ov=both(LB("BARRELEYE", "3:58.02", 300, 220), ST_("A TRANSPARENT HEAD", "3:59.96", "4:02.5"), ST_("TUBE EYES POINTING UP", "4:03.82")))),
    ("4:10.90", V("yt:barreleye", 20, crop=(0.0, 0.1, 0.88, 1.0), ov=ST_("THOSE 'EYES' ARE ITS NOSTRILS", "4:15.06"))),
    # ---------------- MIDNIGHT ZONE (part 2)
    ("4:17.67", A("fall", d0=0.62, d1=0.9, rise=9, ov=HUD(("4:17.67", 950), ("4:20.29", 1000), ("4:25.0", 1100)))),
    ("4:25.52", A("fall", d0=0.92, d1=0.95, rise=8, snow=120, img="img_sil", h=520, rot=-0.2)),
    ("4:30.64", A("fall", d0=0.95, d1=0.95, rise=8, snow=120, ov=both(CH("THE MIDNIGHT ZONE"), ST_("100× SURFACE PRESSURE", "4:33.70", "4:36.6"), ST_("A FEW DEGREES ABOVE FREEZING", "4:37.76")))),
    ("4:40.70", A("fall", d0=0.95, d1=0.96, rise=8, snow=420, lamp=1, lampT="4:41.20", ov=both(FX("coda_click", "4:41.15", 0.5), FX("breath", "4:46.0", 0.6)))),
    ("4:54.03", V("yt:snow_mbari", 3, crop=(0.16, 0.0, 1.0, 0.84), ov=ST_("MARINE SNOW", "4:54.95"))),
    ("5:04.15", V("yt:fang_mbari", 0, crop=(0.16, 0.0, 1.0, 0.84), ov=LB("FANGTOOTH", "5:06.30", 300, 220))),
    ("5:11.57", V("yt:fang_noc", 52, crop=(0.0, 0.12, 1.0, 0.78))),
    ("5:17.97", V("yt:fang_noc", 31, crop=(0.0, 0.12, 1.0, 0.78), ov=ST_("POCKETS BESIDE ITS BRAIN FOR ITS TEETH", "5:19.07"))),
    ("5:23.88", A("angler", tSnap="5:41.23", ov=both(LB("ANGLERFISH", "5:30.78", 380, 220), ST_("A LURE FULL OF GLOWING BACTERIA", "5:32.96", "5:37.2"), FX("thud", "5:41.23", 0.6)))),
    ("5:43.13", V("yt:angler_pair", 62, crop=(0.0, 0.0, 0.86, 0.9), ov=ST_("THE MALES ARE TINY", "5:49.55"))),
    ("5:56.72", V("yt:angler_pair", 79, crop=(0.0, 0.0, 0.86, 0.9), ov=ST_("THEIR BODIES FUSE · THEY SHARE BLOOD", "5:57.98"))),
    ("6:04.03", A("fall", d0=0.96, d1=0.96, rise=7, lamp=1, ov=ST_("ONCE WAS ENOUGH", "6:08.75"))),
    ("6:10.79", A("fall", d0=0.96, d1=0.97, rise=8, lamp=1, img="img_head", h=660, rot=-0.1, ov=HUD(("6:10.79", 1900), ("6:12.0", 2000)))),
    ("6:16.82", V("yt:vampire", 56, ov=LB("VAMPIRE SQUID · HARMLESS", "6:22.28", 300, 220))),
    ("6:28.92", V("yt:vampire", 70, ov=ST_("IT EATS MARINE SNOW", "6:28.92"))),
    ("6:40.47", V("yt:vampire", 90, ov=ST_("A CLOUD OF GLOWING MUCUS", "6:41.49"))),
    # ---------------- THE ABYSS
    ("6:45.47", A("fall", d0=0.97, d1=0.97, rise=8, lamp=1, ov=HUD(("6:45.47", 2800), ("6:47.53", 3000), ("6:48.77", 4000)))),
    ("6:49.83", V("yt:mudmon", 8, crop=(0.0, 0.18, 0.82, 1.0), ov=both(CH("THE ABYSS"), ST_("MORE OF EARTH THAN ALL THE CONTINENTS", "6:58.50")))),
    ("7:07.76", V("yt:seacuc2", 21, ov=LB("SEA CUCUMBER", "7:07.90", 300, 220))),
    ("7:12.22", V("yt:brittle", 13, ov=LB("BRITTLE STAR", "7:12.40", 300, 220))),
    ("7:15.91", V("yt:tripod", 12, crop=(0.0, 0.08, 1.0, 0.86), ov=LB("TRIPOD FISH", "7:17.51", 300, 220))),
    ("7:26.73", A("fall", d0=0.97, d1=0.98, rise=8, lamp=1, img="img_head", h=640, rot=0.25, spin=-0.3, ov=HUD(("7:26.73", 4500), ("7:33.79", 6000)))),
    # ---------------- HADAL ZONE
    ("7:35.97", A("fall", d0=0.98, d1=0.98, rise=8, lamp=1, ov=both(CH("THE HADAL ZONE", "NAMED AFTER HADES"), HUD(("7:35.97", 6000), ("7:41.0", 6200))))),
    ("7:41.71", S(subduction)),
    ("7:55.83", A("fall", d0=0.98, d1=0.98, rise=8, lamp=1, ov=both(ST_("600× SURFACE PRESSURE", "7:56.71"), HUD(("7:55.83", 6500), ("8:02.0", 7000))))),
    # ---------------- (part 3)
    ("8:02.74", V("yt:snail_caladan", 4, crop=(0.06, 0.18, 1.0, 1.0), ov=LB("MARIANA SNAILFISH", "8:20.74", 300, 220))),
    ("8:20.74", V("yt:snail_naut", 17, ov=ST_("DESCRIBED IN 2017 · 7-8 KM DOWN", "8:23.44"))),
    ("8:33.02", V("yt:snail_caladan", 14, crop=(0.06, 0.18, 1.0, 1.0), ov=ST_("A BODY FULL OF WATER: NOTHING TO CRUSH", "8:37.30"))),
    ("8:45.52", V("yt:snail_deepest", 0, crop=(0.0, 0.05, 0.84, 0.89), ov=ST_("2022 · ~8,300 M · NEAR JAPAN", "8:47.38"))),
    ("8:58.83", S(fish_limit, "9:02.73")),
    ("9:15.13", A("fall", d0=0.98, d1=0.99, rise=8, lamp=1, snow=80, img="img_head", h=700, rot=0.0, ov=both(HUD(("9:15.13", 8300), ("9:17.55", 8500), ("9:21.5", 8800)), ST_("YOU LEAVE THE LAST FISH BEHIND", "9:18.73")))),
    ("9:23.85", A("fall", d0=0.99, d1=0.99, rise=8, lamp=1, snow=60, ov=both(HUD(("9:23.85", 9000), ("9:25.75", 10000)), ST_("1,000× SURFACE PRESSURE", "9:27.40")))),
    ("9:31.88", S(elephant, "9:33.28")),
    ("9:40.72", A("fall", d0=0.99, d1=0.99, rise=6, lamp=1, snow=60, h=760, push=0.25, ov=both(FX("hull_creak", "9:40.9", 0.8), ST_("YOUR SUIT GROANS", "9:40.80", "9:43.5")))),
    ("9:48.30", A("bottom", tLand="9:51.40", lampOn=0.2, ov=both(FX("breath", "9:57.0", 0.7), HUD(("9:48.30", 10800), ("9:51.4", 10935)), FX("bubbles", "9:53.4", 0.5)))),
    # ---------------- THE BOTTOM
    ("10:00.87", V("yt:soi_deep", 42, crop=(0.12, 0.31, 0.88, 0.95), ov=both(TT("CHALLENGER DEEP", "10:02.39", "10:07.5", size=150, y=380, sub="ALMOST 11 KM DOWN"), ST_("1-2 °C · NEVER ANY SUNLIGHT", "10:08.43")))),
    ("10:14.64", A("bottom", tLand=-5, lampOn=0.0, amphipods=1.5, ov=ST_("AND YET, IT ISN'T EMPTY", "10:15.50"))),
    ("10:24.16", V("yt:amphi_bait", 5, crop=(0.06, 0.18, 1.0, 1.0), ov=both(LB("AMPHIPODS", "10:24.20", 300, 220), ST_("SCAVENGERS CHECKING IF YOU'RE FOOD", "10:27.18")))),
    ("10:32.06", PH("amphipod", mode="card", ov=both(LB("HIRONDELLEA GIGAS", "10:34.81", 260, 150), ST_("IT CAN DIGEST WOOD", "10:38.81"), CR("Hirondellea gigas · Wikimedia Commons, CC BY-SA 2.5")))),
    ("10:46.52", PH("xeno", mode="card", ov=both(LB("XENOPHYOPHORE", "10:54.14", 260, 150), ST_("ONE SINGLE CELL, AS BIG AS YOUR FIST", "10:57.10"), CR("Xenophyophore · Wikimedia Commons, CC BY 4.0")))),
    ("11:05.64", V("yt:caladan6600", 4, crop=(0.06, 0.18, 1.0, 1.0), ov=ST_("SMALL · SLOW · STRANGE · BUT HERE", "11:12.46"))),
    # ---------------- WHAT GOT THERE FIRST
    ("11:16.51", A("bottom", tLand=-5, lampOn=0.0)),
    ("11:21.08", V("px_plastic_1", 0, ov=both(ST_("A PLASTIC BAG", "11:21.66", "11:24.4", size=110), ST_("RECORDED AT ~10,900 M · DEEP-SEA DEBRIS DATABASE", "11:24.60")))),
    ("11:32.12", V("yt:vescovo_bbc", 63.5, crop=(0.1, 0.1, 1.0, 1.0), ov=ST_("2019 · VICTOR VESCOVO SAW PLASTIC TOO", "11:33.12"))),  # BBC logo cropped off
    ("11:35.62", V("yt:vescovo_bbc", 84.98, speed=0.72, crop=(0.32, 0.0, 1.0, 0.68))),  # the bag itself; crop drops BBC logo and burned-in subtitle
    ("11:39.02", S(tiles, ["2017: PCBs FOUND IN TRENCH AMPHIPODS", "CHEMICALS BANNED IN MANY COUNTRIES", "SOME LEVELS HIGHER THAN IN CRABS FROM A POLLUTED CHINESE RIVER"], ["11:40.70", "11:49.46", "11:51.88"], top=250, size=78)),
    ("11:57.86", V("px_trash_0", 0, ov=ST_("THE MOST REMOTE PLACE ON EARTH", "11:59.28"))),
    ("12:04.70", V("px_plastic_1", 6, ov=ST_("OUR TRASH GOT THERE FIRST", "12:08.25"))),
    # ---------------- WHO HAS BEEN THERE (part 4)
    ("12:10.13", PH("trieste_crew", mode="card", ov=both(TT("JANUARY 1960", "12:10.30", size=130, y=110), CR("Trieste over the Mariana Trench, 1960 · US Navy, public domain")))),
    ("12:16.57", PH("trieste", mode="card", ov=both(ST_("JACQUES PICCARD & DON WALSH · THE TRIESTE", "12:16.70"), CR("Bathyscaphe Trieste · US Navy, public domain")))),
    ("12:22.00", V("yt:trieste_mt", 30, crop=(0.04, 0.16, 0.8, 1.0), ov=ST_("A WINDOW CRACKED · THEY KEPT GOING", "12:24.80"))),
    ("12:28.89", A("fall", d0=0.99, d1=0.99, rise=6, lamp=1, img="img_sil", ov=ST_("NEARLY FIVE HOURS DOWN", "12:29.20"))),
    ("12:35.53", A("bottom", tLand=0.5, lampOn=0.0, ov=ST_("20 MINUTES · TOO MUCH MUD TO SEE", "12:35.80"))),
    ("12:40.35", V("px_dark_1", 0, ov=ST_("THEN, FOR MORE THAN 50 YEARS, NO ONE WENT BACK", "12:41.15"))),
    ("12:44.41", V("yt:cameron_sub", 15, crop=(0.0, 0.0, 0.88, 0.88), ov=ST_("2012 · JAMES CAMERON, SOLO", "12:45.00"))),
    ("12:52.33", V("yt:vescovo_bbc", 20, crop=(0.32, 0.0, 1.0, 0.68), ov=ST_("SINCE 2019 · A REUSABLE SUBMERSIBLE", "12:52.71"))),
    ("13:00.19", S(tiles, ["1960 · TRIESTE", "2012 · DEEPSEA CHALLENGER", "2019 ON · LIMITING FACTOR", "THAT'S EVERYONE"], ["13:00.19", "13:00.80", "13:01.40", "13:02.17"])),
    # ---------------- DARKNESS AT THE BOTTOM
    ("13:04.51", A("bottom", tLand=-5, lampOn=0.0)),
    ("13:08.67", A("bottom", tLand=-5, lampOn=0.0, lampOff="13:09.65", ov=both(ST_("TOTAL DARKNESS", "13:11.19", "13:12.5"), ST_("TOTAL SILENCE", "13:12.67"), FX("breath", "13:14.0", 0.8)))),
    ("13:17.87", S(big_card, "1,000×", "THE PRESSURE YOU WERE BORN INTO", "13:18.63")),
    ("13:23.81", V("yt:amphi_super", 10, crop=(0.06, 0.18, 1.0, 1.0))),
    ("13:30.55", PH("xeno", mode="card", zoom=(1.1, 1.0))),
    ("13:33.15", V("yt:soi_deep", 50, ov=ST_("BACTERIA FEEDING ON CHEMICALS FROM THE ROCKS", "13:33.30"))),
    ("13:42.16", V("yt:snow_noaa", 2, crop=(0.06, 0.0, 0.94, 0.88), ov=ST_("PIECES OF OUR WORLD KEEP FALLING", "13:44.20"))),
    ("13:47.62", S(tiles, ["MARINE SNOW", "OLD WOOD", "PLASTIC", "CHEMICALS"], ["13:47.62", "13:49.04", "13:50.22", "13:51.44"])),
    ("13:52.65", V("px_plastic_1", 10, ov=ST_("THE DEEPEST PLACE ON EARTH IS THE LAST STOP", "13:56.42"))),
    # ---------------- THE WAY UP
    ("14:00.39", A("ascent", d0=0.99, d1=0.97, ov=both(ST_("THE WAY UP MAY BE HARDER", "14:05.33"), FX("breath", "14:01.2", 0.7)))),
    ("14:07.75", V("yt:snail_caladan", 26, crop=(0.06, 0.18, 1.0, 1.0))),
    ("14:13.75", A("bends", tFizz="14:20.67", ov=both(ST_("GAS IN YOUR BLOOD FORMS BUBBLES", "14:20.67"), FX("bubbles", "14:21.0", 0.7)))),
    ("14:25.65", A("ascent", d0=0.97, d1=0.9)),
    ("14:30.24", V("yt:tripod", 20, crop=(0.0, 0.08, 1.0, 0.86))),
    ("14:35.40", V("yt:angler_noaa", 18)),
    ("14:39.59", A("migration")),
    ("14:44.57", A("ascent", d0=0.45, d1=0.04, surface=[-500, 80], ov=FX("bubbles", "14:48.0", 0.5))),
    ("14:53.32", V("px_sunset_0", 0, ov=FX("splash", "14:54.5", 0.8))),
    ("14:56.30", V("px_float_1", 6)),
    ("15:04.66", S(trench_section)),
    ("15:11.07", V("yt:snail_caladan", 30, crop=(0.06, 0.18, 1.0, 1.0), ov=ST_("QUIET · PATIENT · ALMOST COMPLETELY UNSEEN", "15:11.20"))),
    ("15:15.51", V("yt:amphi_super", 24, crop=(0.06, 0.18, 1.0, 1.0))),
    ("15:21.15", V("px_surface_3", 0)),
    ("15:24.93", lambda a, b: (anim(a, b, "fall", d0=0.6, d1=0.95, rise=6), layer(a, b, endcard(a, b, s("15:25.75"))))),
]
SHOTS = [x for x in SHOTS if x[1] is not None]

CSS = open(H / "style.css", encoding="utf-8").read()
IMGS = {"img_fall": "diver_fall", "img_head": "diver_head", "img_kneel": "diver_kneel", "img_sil": "diver_sil", "img_angler": "c_angler", "img_lantern": "il_lantern"}
FAMILY = {"water_whoosh": ("swell", 6, 30), "deep_boom": ("boom", 4, 20), "drone_swell": ("drone", 3, 40), "bubbles": ("bubbles", 3, 15),
          "sonar_ping": ("sonar", 3, 0), "thud": ("thud", 3, 0), "wave": ("wave", 1, 0), "breath": ("breath", 3, 0)}


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
<script src="assets/js/ocean.js"></script><script src="assets/js/trench.js"></script>
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
