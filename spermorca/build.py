"""What If Sperm Whales Hunted Like Orcas? (Unseen Kingdom). Writes parts/p1..p4.html timed to the voice, sfx.json and usage.json.
Canvas story scenes come from assets/js/scenes.js, graphics from scenes2d.py, footage from assets/raw."""
import json, sys
from lib import *
from scenes2d import *

END = 1334.32
PARTS = [round(x * 30) / 30 for x in (0.0, s("5:44.31"), s("11:12.14"), s("16:37.94"), END)]


ROT = {}


def pick(src):
    """px_name without an index: rotate through the downloaded options so repeated subjects use different clips."""
    import re, glob
    if not src.startswith("px_") or re.search(r"_\d+$", src): return src
    opts = sorted(glob.glob(str(H / "assets" / "raw" / (src + "_*.mp4"))))
    if not opts: return src + "_0"
    k = ROT.get(src, 0); ROT[src] = k + 1
    return Path(opts[k % len(opts)]).stem


# real underwater sperm whales (Dominica): good in-points, solo and groups; two of every three sperm whale shots use them
DOM_SOLO = [4, 13, 17, 50, 55, 84, 88, 92, 101, 118, 122, 126, 130, 134, 143, 59, 97, 21]
DOM_POD = [25, 29, 38, 42, 105, 109, 33, 113]
DOMC = (0.0, 0.0, 0.85, 0.86)          # drops the SeaLife bug at lower right


BC = (0.0, 0.0, 1.0, 0.86)          # drops the channel bug at lower left
# wild footage that replaces stock subjects (Pexels orcas are captive, its tails and sharks off-topic)
NG = (0.0, 0.1, 0.88, 1.0)   # drops a corner logo at upper right
SUBS = {
    "px_orca": [("yt:bremer", 108, BC), ("yt:iceseal", 143, None), ("yt:bremer", 120, BC), ("yt:bremer", 126, BC), ("yt:bremer", 156, BC),
                ("yt:iceseal", 77, None), ("yt:bremer", 138, BC), ("yt:abc_orca", 58, NG), ("yt:bremer", 174, BC), ("yt:abc_orca", 74, None)],
    "px_tail": [("yt:laguna", 2, None), ("yt:surfacing", 2, None), ("yt:laguna", 14, None), ("yt:surfacing", 14, None)],
    "px_shark": [("pin_shark", 1, NG), ("yt:portstar", 393, (0.12, 0.06, 0.86, 0.86)), ("px_shark_1", 0, None)],
    "px_hump": [("yt:hump_maui", 0, None), ("pin_orca", 2, None), ("yt:hump_maui", 35, None)],
    "px_blue": [("pin_sperm", 8, None), ("pin_orca", 12, None)],
}
SUBS["px_orcapod"] = SUBS["px_orca"]
CREDIT = {"yt:bremer": "Footage: Whale Watch Western Australia", "yt:iceseal": "Footage: Laag Ni Ivan", "yt:abc_orca": "Footage: ABC News", "yt:fluke": "Footage: Recalibrated Robot",
          "yt:laguna": "Footage: LagunaBluebelt", "yt:surfacing": "Footage: Adventuring Dave", "pin_shark": "Footage via Pinterest", "yt:portstar": "Footage: Good Morning South Africa",
          "pin_orca": "Footage via Pinterest", "yt:hump_maui": "Footage: Domenic Biagini", "yt:bluewhale": "Footage: Duke Jarboe", "pin_sperm": "Footage via Pinterest"}


def V(src, ss=0, speed=1.0, ov=None, **kw):
    def f(a, b):
        s_, ss_, kw_ = src, ss, dict(kw)
        cr_ = None
        if src in SUBS:
            key = "sub_" + src; k = ROT.get(key, 0); ROT[key] = k + 1
            opts = [o for o in SUBS[src] if os.path.exists(src_path(o[0]))]
            if opts:
                s_, ss_, c_ = opts[k % len(opts)]
                if c_: kw_["crop"] = c_
                cr_ = CREDIT.get(s_)
        if src in ("px_sperm", "px_spermpod"):
            key = "dom_" + src; k = ROT.get(key, 0); ROT[key] = k + 1
            if True:   # always real sperm whales: Pexels aerials may be other species
                lst = DOM_SOLO if src == "px_sperm" else DOM_POD
                s_, ss_ = "yt:dominica", lst[k % len(lst)]
                kw_["crop"] = DOMC
                if ov is None: kw_.setdefault("dark", kw.get("dark", 0))
        video(a, b, pick(s_), ss_, speed, **kw_)
        if s_ == "yt:dominica": cr_ = "Footage: Nadia Aly Underwater"
        if cr_: layer(a, b, credit(cr_))
        if ov: layer(a, b, ov(a, b))
    return f


def A(name, ov=None, **opts):
    def f(a, b):
        anim(a, b, name, **opts)
        if not ST.get("prevA"): sfx("water_whoosh", a - 0.4, 0.3)   # a swell only when we cut from footage into a story scene
        ST["curA"] = True
        if ov: layer(a, b, ov(a, b))
    return f


def S(fn, *args, **kw):
    return lambda a, b: layer(a, b, fn(a, b, *args, **kw))


def PH(name, ov=None, **kw):
    return lambda a, b: layer(a, b, photo(a, b, name, **kw) + (ov(a, b) if ov else ""))


def CH(text, sub=None):
    def f(a, b):
        sfx("deep_boom", a + 0.1, 0.8)
        return dim(0.3) + title(text, a + 0.2, min(b, a + 4.4), sub=sub, sub_t=a + 1.3)
    return f


def both(*fs): return lambda a, b: "".join(f(a, b) or "" for f in fs)
def ST_(text, t, end=None, **kw): return lambda a, b: stamp(text, t, end, **kw)
def LB(text, t, x, y, **kw): return lambda a, b: label(text, t, x, y, **kw)
def CR(text): return lambda a, b: credit(text)
def FX(name, t, vol=1.0):
    def f(a, b):
        sfx(name, t, vol); return ""
    return f
def TT(text, t, end=None, y=380, size=150, sub=None):
    return lambda a, b: title(text, t, end or b - 0.1, y=y, size=size, sub=sub, sub_t=s(t) + 1.0)


BREMER = CR("Footage: Whale Watch Western Australia")
SC_ = (0.2, 0.28, 0.8, 0.86)       # punch in on the distant orca
STAR = CR("Footage: White Shark Ocean")
CETI = CR("Footage: Project CETI")

SHOTS = [
    # ---------------- HOOK: twelve shapes
    ("0:00.00", A("rise", depth0=0.85, depth1=0.6, start=1350, end=820, ov=both(lambda a, b: fade_in_black(a, 2.0), FX("drone_swell", 0.2, 0.5)))),
    ("0:09.08", A("rise", depth0=0.6, depth1=0.45, start=1000, end=560, ov=ST_("MORE THAN A KILOMETRE DOWN", "0:09.94", "0:12.00"))),
    ("0:15.36", A("rise", depth0=0.45, depth1=0.35, start=760, end=420, silhouette=0.55, ov=ST_("COMPLETELY SILENT", "0:18.10"))),
    ("0:20.41", A("rise", blue=1, surface=[40, 90], depth0=0.35, depth1=0.3, start=1250, end=900, ov=LB("BLUE WHALE", "0:21.69", 1160, 210))),
    ("0:28.12", A("pod", prey="blue", preyFlip=1, n=12, speed=0.8, ov=ST_("12 SPERM WHALES", "0:28.30"))),
    ("0:34.28", V("px_orcapod", 0, ov=ST_("HUNTING LIKE ORCAS", "0:34.40"))),
    ("0:36.02", V("px_sperm", 0)),
    ("0:40.64", V("px_spermpod", 0)),
    ("0:48.34", V("px_sperm", 4, ov=ST_("THE BRAIN", "0:48.40"))),
    ("0:49.80", A("rams", tHit="0:50.60", ov=both(ST_("THE WEAPONS", "0:49.85"), FX("thud", "0:50.60", 0.8)))),
    ("0:51.26", V("px_spermpod", 3, ov=ST_("THE FAMILIES", "0:51.30"))),
    ("0:52.74", A("pod", n=6, speed=1.2, ov=ST_("THE TEAMWORK", "0:52.78"))),
    ("0:53.96", V("px_spermpod", 6, ov=ST_("THE LANGUAGE", "0:54.00"))),
    ("0:55.36", V("px_sperm", 8, ov=ST_("EVEN THE CULTURE", "0:55.40"))),
    ("0:57.36", V("px_tail", 0, ov=ST_("ONLY THE DECISION IS MISSING", "0:57.60"))),
    ("1:00.01", A("rise", depth0=0.55, depth1=0.4, start=1200, end=650)),
    ("1:03.24", A("pod", prey="blue", preyFlip=1, n=10, speed=0.7, ov=both(lambda a, b: dim(0.35), TT("WHAT IF SPERM WHALES HUNTED LIKE ORCAS?", "1:03.40", size=120, y=420)))),
    # ---------------- THE KING
    ("1:10.06", V("px_orca", 0, ov=CH("THE KING", "WHY THE ORCA RULES"))),
    ("1:15.00", V("px_orcapod", 4)),
    ("1:22.27", A("lineup", pxPerM=56, items=[["orca", 8.5, "1:23.95"], ["shark", 6, "1:30.30"], ["hump", 15, "1:33.90"], ["blue", 25, "1:36.94"]], gap=200, y0=150,
                  ov=both(LB("ORCA · 8-9 M", "1:24.30", 660, 125), LB("GREAT WHITE · CLOSE", "1:30.60", 520, 325), LB("HUMPBACK · NEARLY TWICE AS LONG", "1:34.30", 1040, 525), LB("BLUE WHALE · 3× LONGER", "1:37.30", 1600, 725, side="right")))),
    ("1:40.00", V("px_orcapod", 8, ov=ST_("ORCAS HUNT ALL OF THEM", "1:40.50"))),
    ("1:42.48", V("yt:bremer", 8, crop=BC, ov=both(BREMER, TT("2019 · WESTERN AUSTRALIA", "1:42.60", size=110, y=440)))),
    ("1:46.71", V("yt:bremer", 12, crop=BC, ov=BREMER)),
    ("1:51.75", V("yt:bremer", 24, crop=BC, ov=both(BREMER, ST_("A HEALTHY ADULT BLUE WHALE", "1:55.40")))),
    ("1:58.49", V("yt:bremer", 36, crop=BC, ov=both(BREMER, ST_("THEY TOOK TURNS", "1:58.60")))),
    ("2:04.13", V("yt:bremer", 54, crop=BC, ov=both(BREMER, ST_("BLOCKING ITS DIVE", "2:04.30")))),
    ("2:07.49", V("yt:bremer", 60, crop=BC, ov=both(BREMER, ST_("ONE COVERED ITS BLOWHOLE", "2:08.40")))),
    ("2:12.28", V("yt:bremer", 78, crop=BC, ov=both(BREMER, ST_("OVER 20 M LONG · IT DIDN'T SURVIVE", "2:12.40")))),
    ("2:16.43", V("yt:bremer2", 3, crop=BC, ov=both(BREMER, ST_("IT HAS HAPPENED AGAIN", "2:17.20")))),
    ("2:20.37", V("px_shark", 0, ov=TT("SOUTH AFRICA", "2:23.80", size=130, y=440))),
    ("2:25.54", V("yt:portstar", 107, crop=(0.12, 0.06, 0.86, 0.86), ov=both(CR("Footage: Good Morning South Africa"), ST_("PORT AND STARBOARD", "2:26.00")))),
    ("2:29.98", V("yt:starboard", 64, crop=SC_, ov=both(STAR, ST_("FLIP THE SHARK · EAT THE LIVER", "2:34.60")))),
    ("2:37.54", V("px_shark", 6, dark=0.1)),
    ("2:41.72", V("px_shark", 2, ov=ST_("THE GREAT WHITES LEFT", "2:48.91"))),
    ("2:50.45", V("yt:starboard", 118, crop=SC_, ov=both(STAR, ST_("2023 · ONE ORCA · ABOUT TWO MINUTES", "2:52.40")))),
    ("2:59.90", V("px_orca", 6, ov=both(ST_("NOT SIZE", "3:03.13", "3:04.55"), ST_("NOT TEETH", "3:04.65", "3:06.10"), ST_("STRATEGY", "3:06.24", size=110)))),
    ("3:07.97", V("px_orcapod", 12, ov=LB("LED BY OLDER FEMALES", "3:09.41", 300, 200))),
    ("3:12.04", V("px_orca", 12, ov=ST_("HUNTING METHODS, PASSED DOWN LIKE RECIPES", "3:15.94"))),
    ("3:19.86", A("wavewash", tDive="3:27.40", ov=both(TT("ANTARCTICA", "3:20.00", "3:23.50", size=110, y=120), FX("wave", "3:28.4", 0.8)))),
    ("3:30.31", V("yt:iceseal", 110, ov=CR("Footage: Laag Ni Ivan"))),
    ("3:37.11", V("yt:beach", 6, ov=both(CR("Footage: Jorge Cazenave"), TT("ARGENTINA", "3:37.30", "3:40.00", size=110, y=120)))),
    ("3:45.35", V("yt:beach2", 32, ov=both(CR("Footage: Anthropocene.Photography"), ST_("TEACHING", "3:48.53", size=110)))),
    ("3:49.79", S(diets, ["3:54.69", "3:56.37", "3:58.03"])),
    ("4:00.05", S(silence, "4:03.31")),
    ("4:11.38", S(tiles, ["INTELLIGENCE", "TEAMWORK", "TEACHING", "SILENCE"], ["4:11.40", "4:12.68", "4:13.86", "4:14.95"])),
    ("4:16.28", A("lineup", pxPerM=90, gap=330, y0=330, items=[["orca", 8.5, "4:16.40"], ["sperm", 16, "4:17.20"]], ov=ST_("FIVE TIMES HEAVIER", "4:18.14"))),
    # ---------------- THE CHALLENGER
    ("4:20.22", V("px_sperm", 12, ov=CH("THE CHALLENGER", "THE SPERM WHALE"))),
    ("4:22.00", S(size_bus, "4:24.44", "4:29.90")),
    ("4:32.56", V("px_spermpod", 9, ov=ST_("THE LARGEST PREDATOR WITH TEETH", "4:32.80"))),
    ("4:41.16", S(head_third)),
    ("4:48.87", V("px_sperm", 2, ov=ST_("MORE LIKE A SUBMARINE THAN AN ANIMAL", "4:51.51"))),
    ("4:54.32", S(brain, "5:01.78")),
    ("5:04.86", V("px_sperm", 6, ov=ST_("BIGGER BODY, BIGGER BRAIN", "5:08.60"))),
    ("5:15.38", V("px_spermpod", 12, dark=0.15)),
    ("5:19.74", A("dive", tDive="5:29.20", ov=both(ST_("2,000+ METRES · OVER AN HOUR", "5:33.30"), FX("blow", "5:24.4", 0.8), FX("blow", "5:26.3", 0.7), FX("splash", "5:29.6", 0.8), FX("bubbles", "5:31.0", 0.6)))),
    # ---------------- (part 2)
    ("5:44.31", A("clicks", tEcho="5:56.79", ov=both(ST_("THE LOUDEST SOUND OF ANY ANIMAL", "5:46.63", "5:52.0"), FX("sonar_ping", "5:56.79", 0.6)))),
    ("6:01.00", S(head_inside, "6:08.80")),
    ("6:14.77", PH("spermaceti", mode="card", ov=both(ST_("BURNED CLEAN AND BRIGHT IN LAMPS", "6:19.20"), CR("Hadwen & Barney spermaceti candle factory, Nantucket · HABS, public domain")))),
    ("6:24.97", S(head_inside, "6:24.97", t_beam="6:28.09")),
    ("6:31.99", A("essex", t1="6:46.18", t2="6:50.04", tSink="6:51.20", ov=both(TT("1820 · THE ESSEX", "6:32.10", "6:38.00", size=120, y=130),
                                                                               FX("hull_groan", "6:46.2", 1.0), FX("deep_boom", "6:46.2", 0.8), FX("hull_creak", "6:50.1", 1.0)))),
    ("6:52.95", PH("essex", mode="card", ov=both(ST_("ONLY A FEW SURVIVED", "6:56.69"), CR("The Essex struck by the whale, sketch by crew member Thomas Nickerson · public domain")))),
    ("6:58.75", PH("mobydick", mode="card", ov=CR("Moby-Dick, 1851 · public domain"))),
    ("7:04.46", A("rams", tHit="7:09.76", ov=both(FX("thud", "7:09.76", 1.0), FX("bubbles", "7:10.0", 0.5)))),
    ("7:12.36", V("px_sperm", 10, ov=ST_("THAT HEAD CAN SINK A SHIP", "7:15.96"))),
    ("7:18.29", S(tiles, ["SIZE", "A BRAIN", "A SOUND WEAPON", "A BATTERING RAM"], ["7:18.99", "7:20.71", "7:22.21", "7:24.35"])),
    ("7:25.94", V("px_sperm", 14, ov=ST_("WHAT ABOUT THE TEETH?", "7:26.00"))),
    ("7:30.51", PH("sperm_teeth", mode="card", ov=both(ST_("TEETH ONLY IN THE LOWER JAW", "7:31.47", "7:36.60"), ST_("UP TO ~26 EACH SIDE · NEARLY 1 KG EACH", "7:36.80"), CR("Sperm whale teeth · Wikimedia Commons, CC BY-SA 4.0")))),
    ("7:43.49", PH("sperm_skull", mode="card", ov=both(LB("SOCKETS IN THE UPPER JAW", "7:44.43", 1160, 260), CR("Iziko Museum sperm whale skeleton · Wikimedia Commons, CC BY 3.0")))),
    ("7:48.53", V("px_sperm", 16, ov=ST_("BROKEN JAWS · TWISTED JAWS · NO TEETH", "7:51.26"))),
    ("8:02.64", V("px_spermpod", 15, ov=ST_("TEETH MAY NOT BE NEEDED", "8:03.40"))),
    ("8:06.10", A("clicks", suck=1, tEcho="8:07.00", tSuck="8:10.00", ov=ST_("SUCTION FEEDING", "8:08.46"))),
    ("8:17.54", A("rise", blue=1, surface=[60, 80], depth0=0.3, depth1=0.3, start=900, end=860, ov=ST_("A BLUE WHALE AT THE SURFACE? NO.", "8:18.00"))),
    ("8:20.86", V("px_sperm", 18, dark=0.1)),
    # ---------------- FAMILY
    ("8:24.23", A("descend", ov=ST_("A GIANT LONER?", "8:26.75"))),
    ("8:33.52", V("px_spermpod", 18, ov=CH("THE FAMILY"))),
    ("8:40.92", S(tiles, ["MOTHERS", "DAUGHTERS", "AUNTS", "GRANDMOTHERS", "CALVES"], ["8:41.00", "8:41.62", "8:42.56", "8:43.26", "8:44.06"], top=140, size=96)),
    ("8:45.26", V("px_calf", 0, ov=ST_("BONDS THAT LAST DECADES", "8:46.08"))),
    ("8:47.71", A("babysit", tDive="8:53.34", ov=ST_("BABYSITTERS", "8:57.52"))),
    ("9:02.32", V("px_spermpod", 21, ov=ST_("EXACTLY WHAT ORCAS ARE FAMOUS FOR", "9:03.28"))),
    ("9:08.01", V("px_spermpod", 24, ov=ST_("THEY TALK", "9:08.87", size=110))),
    ("9:10.39", S(codas, ["9:16.65", "9:16.95", "9:17.63", "9:19.21"], "9:20.31")),
    ("9:25.37", S(dialects)),
    ("9:43.34", V("yt:ceti_vowels", 47, ov=both(CETI, TT("2024 · PROJECT CETI", "9:43.50", "9:48.50", size=110, y=120)))),
    ("9:53.65", S(alphabet, ["9:55.00", "9:57.81", "9:58.79", "9:59.75"])),
    ("10:07.84", V("yt:ceti_birth", 45, ov=both(CETI, ST_("WE DON'T KNOW WHAT ANY CODA MEANS", "10:11.58")))),
    ("10:18.63", V("px_fishboat", 0, ov=TT("GULF OF ALASKA", "10:22.46", size=110, y=120))),
    ("10:24.12", A("longline", steal=1)),
    ("10:31.34", V("yt:seaswap", 36, crop=(0.08, 0.0, 0.92, 0.72), ov=both(ST_("STRIPPING FISH OFF THE HOOKS", "10:37.72"), CR("Footage: SEASWAP / NOAA Fisheries")))),
    ("10:41.51", V("px_spermpod", 27, ov=ST_("THE BEHAVIOUR SPREAD", "10:42.19"))),
    ("10:52.20", S(tiles, ["FAMILIES", "BABYSITTING", "DIALECTS", "LEARNED BEHAVIOUR"], ["10:52.20", "10:53.44", "10:54.82", "10:56.10"])),
    ("10:57.74", V("px_orcapod", 16, ov=ST_("THE SAME INGREDIENTS AS ORCAS", "10:58.68"))),
    ("11:01.96", V("px_sperm", 20)),
    ("11:04.54", V("px_spermpod", 30)),
    # ---------------- (part 3) 1997
    ("11:12.14", V("px_orcapod", 20, ov=TT("1997 · CALIFORNIA", "11:12.30", size=120, y=420))),
    ("11:16.18", A("marguerite", tForm="11:25.85", tOrcas="11:17.60", attack=1, tPull="11:48.77", tBack="11:52.51", helpers=1,
                  ov=both(ST_("THE MARGUERITE FORMATION", "11:34.98", "11:43.50"), ST_("TWO WENT BACK FOR ONE", "11:51.97")))),
    ("11:57.73", V("px_spermpod", 33, dark=0.15)),
    ("12:05.27", V("px_spermpod", 36, ov=ST_("THEY COORDINATE · THEY PROTECT", "12:08.69"))),
    ("12:17.26", A("marguerite", tForm=0.2, tOrcas=0.5, ov=ST_("ONLY TO DEFEND", "12:19.10"))),
    # ---------------- WHY NOT?
    ("12:20.66", V("px_sperm", 22, ov=ST_("SO WHY DON'T THEY HUNT LIKE ORCAS?", "12:28.90"))),
    ("12:33.99", S(squid_tons, "12:44.67")),
    ("12:48.04", A("descend", ov=ST_("THE FOOD IS IN THE DARK", "12:51.06"))),
    ("12:55.08", A("forage", ov=ST_("EACH WHALE MOSTLY ON ITS OWN", "13:02.20"))),
    ("13:14.00", A("forage", ov=ST_("SPREAD OUT HUNDREDS OF METRES", "13:16.70"))),
    ("13:29.70", A("race", ov=ST_("BUILT FOR THE DEEP, NOT FOR SPEED", "13:31.40"))),
    ("13:44.47", V("px_tail", 6, ov=ST_("A SPECIALIST", "13:50.81", size=110))),
    # ---------------- REWRITE EVOLUTION
    ("13:55.45", A("rise", depth0=0.7, depth1=0.5, start=1200, end=700, ov=CH("REWRITE EVOLUTION"))),
    ("14:04.08", A("pod", n=12, leader=1, speed=0.9, ov=both(lambda a, b: step(a, b, 1, "FORGET THE DEEP", "14:05.30"), LB("THE OLDEST FEMALE LEADS", "14:19.32", 1100, 300)))),
    ("14:23.02", V("px_seal", 0, ov=both(lambda a, b: step(a, b, 2, "NEW PREY", "14:24.32"), ST_("SEALS · TOO SMALL, TOO FAST", "14:26.50")))),
    ("14:29.84", V("px_dolphin", 0, ov=ST_("DOLPHINS · EVEN FASTER", "14:30.00"))),
    ("14:35.24", A("lineup", pxPerM=56, gap=260, y0=280, items=[["hump", 15, "14:41.42"], ["gray", 8, "14:45.06"], ["blue", 25, "14:49.72"]],
                  ov=both(ST_("OTHER WHALES", "14:39.82", "14:41.20"), LB("HUMPBACK · 30-40 T", "14:42.36", 1000, 255), LB("GRAY WHALE CALF", "14:46.16", 620, 515), LB("BLUE WHALE · NOT A FIGHTER", "14:52.60", 1500, 775, side="right")))),
    ("14:54.25", A("surround", tClose="15:06.30", tBreath="15:01.68", ov=lambda a, b: step(a, b, 3, "NEW TACTICS", "14:55.57"))),
    ("15:10.90", A("ram", tHit="15:20.31", ov=both(ST_("MASS", "15:10.95", "15:13.00", size=130), ST_("CLOSER TO A SHIP COLLISION", "15:21.81"), FX("thud", "15:20.31", 1.0), FX("deep_boom", "15:20.35", 0.8)))),
    ("15:24.19", A("essex", t1=0.9, t2=50, tSink=60, ov=ST_("REMEMBER THE ESSEX?", "15:24.30"))),
    ("15:25.79", V("px_sperm", 24, ov=ST_("AND THEN THERE'S THE SOUND", "15:26.71"))),
    ("15:28.31", A("clicks", every=0.35, ov=both(TT("THE BIG BANG HYPOTHESIS", "15:42.81", size=120, y=420), ST_("1980s", "15:28.40", "15:31.40", size=100)))),
    ("15:45.33", V("px_sperm", 26, dark=0.1, ov=ST_("NEVER PROVEN", "15:46.47", size=110))),
    ("15:52.17", A("bigbang", tFire="15:59.02", ov=both(FX("deep_boom", "15:59.1", 0.9), FX("sonar_ping", "15:59.05", 1.0), FX("sonar_ping", "15:59.65", 0.8), FX("sonar_ping", "16:00.25", 0.7)))),
    ("16:07.24", A("pod", n=12, speed=0.6, depth=0.4, ov=ST_("FIRST, LEARN TO HUNT QUIETLY", "16:10.59"))),
    ("16:20.88", A("rise", blue=1, surface=[30, 80], depth0=0.4, depth1=0.3, start=1300, end=760, ov=ST_("THE NEW KING HAS ARRIVED", "16:31.79"))),
    ("16:33.89", V("px_orcapod", 24, ov=ST_("BUT THE OLD KING IS STILL HERE", "16:35.03"))),
    # ---------------- (part 4) TWO KINGS
    ("16:37.94", V("px_orcapod", 28, ov=CH("TWO KINGS", "PURE SPECULATION"))),
    ("16:46.36", V("px_orca", 18, ov=ST_("SPEED · AGILITY · INHERITED KNOWLEDGE", "16:47.40"))),
    ("16:59.87", A("pod", n=6, speed=1.0, len=480, ov=ST_("SIZE · A BATTERING-RAM HEAD", "17:01.00"))),
    ("17:05.89", V("px_orcapod", 32, ov=ST_("ORCAS TARGET THE WEAKEST", "17:07.67"))),
    ("17:13.84", V("px_spermpod", 39, ov=ST_("A VERY RISKY FIGHT", "17:16.56"))),
    ("17:18.72", A("pod", n=8, speed=1.6, prey="orca", preyLen=380, preyDx=40, ov=ST_("NOW THEY'RE HUNTING", "17:24.25"))),
    ("17:32.96", V("px_shark", 10, ov=ST_("REMEMBER THE SHARKS?", "17:33.86"))),
    ("17:45.10", A("avoid", tTurn="17:50.0", ov=ST_("PREDATORS AVOID PREDATORS", "17:45.20"))),
    ("17:55.64", V("px_orca", 24, ov=ST_("AVOIDANCE", "17:55.70", size=110))),
    ("18:03.40", V("px_lion", 0, ov=ST_("LIKE LIONS AND HYENAS", "18:03.50"))),
    ("18:06.82", V("px_hyena", 0)),
    ("18:10.42", lambda a, b: (video(a, b, "yt:bremer", 120, w=956, crop=BC, zoom=(1.0, 1.05)), video(a, b, "yt:dominica", 88, x=964, w=956, crop=DOMC, zoom=(1.0, 1.05)), layer(a, b, ST_("TWO KINGS", "18:11.38", size=120)(a, b)))),
    ("18:15.72", V("px_sperm", 32, ov=ST_("IT CHANGES EVERYTHING UNDERNEATH", "18:19.84"))),
    ("18:22.45", S(foodweb, ["18:26.37", "18:35.98", "18:38.60", "18:40.52"])),
    ("18:45.11", A("pump", tUp="18:51.06", tRelease="18:54.78", ov=both(FX("bubbles", "18:54.9", 0.6), ST_("THE WHALE PUMP", "18:48.72", "18:55.0"), ST_("IRON FEEDS PLANKTON", "18:58.82")))),
    ("19:02.64", V("px_plankton", 0, ov=ST_("HUNDREDS OF THOUSANDS OF TONNES OF CARBON A YEAR", "19:07.86", size=60))),
    ("19:13.13", A("pump", tUp=0.1, tRelease=50, ov=ST_("THAT PUMP WOULD WEAKEN", "19:16.03"))),
    ("19:17.83", V("px_hump", 0, ov=ST_("STILL RECOVERING FROM WHALING", "19:22.13"))),
    ("19:24.75", V("px_blue", 0, ov=ST_("PUSHED BACK TOWARD COLLAPSE", "19:27.25"))),
    ("19:29.85", A("layers", ov=ST_("A HOLE IN TWO ECOSYSTEMS AT ONCE", "19:34.97"))),
    ("19:40.92", V("px_sperm", 34, ov=ST_("THE OCEAN DOESN'T NEED ANOTHER ORCA", "19:46.62"))),
    ("19:51.88", V("px_orca", 36, ov=ST_("KING OF THE SURFACE?", "19:54.40"))),
    ("19:59.42", V("px_orcapod", 36, ov=ST_("THE SUNLIT TOP FEW HUNDRED METRES", "19:59.80"))),
    ("20:09.36", A("layers", squid=1, ov=ST_("BELOW: THE LARGEST LIVING SPACE ON THE PLANET", "20:14.08"))),
    ("20:22.65", A("descend", ov=ST_("AND IT HAS A RULER TOO", "20:22.80"))),
    ("20:26.69", A("clicks", ov=ST_("HUNTING GIANT SQUID IN TOTAL DARKNESS", "20:27.69"))),
    ("20:32.30", V("px_sperm", 38, ov=ST_("COVERED IN SCARS", "20:33.24"))),
    ("20:37.69", V("px_tail", 12, ov=ST_("A CROWN HELD FOR MILLIONS OF YEARS", "20:39.39"))),
    ("20:43.42", V("px_spermpod", 42)),
    ("20:52.34", PH("whaling_20th", mode="card", ov=both(ST_("IT WAS US", "20:52.40", size=120), CR("Archive photo · public domain")))),
    ("20:59.80", PH("whaling_20b", mode="card", zoom=(1.1, 1.0), ov=both(ST_("ENTIRE FAMILIES DISAPPEARED", "20:59.90"), CR("Whaling station, about 1915 · public domain")))),
    ("21:05.71", V("px_spermpod", 45, ov=ST_("FAMILIES · CLANS · CODAS", "21:07.51"))),
    ("21:14.42", PH("whaling_1921", mode="card", zoom=(1.0, 1.12), origin="40% 50%", ov=both(ST_("WIPING OUT CULTURES", "21:16.50"), CR("Archive photo, 1921 · public domain")))),
    ("21:20.88", V("px_hydro", 0, ov=ST_("RECORDING THEIR CONVERSATIONS", "21:23.44"))),
    ("21:32.24", V("px_sperm", 40)),
    ("21:39.44", A("descend", ov=ST_("THE LARGEST BRAIN ON EARTH", "21:41.78"))),
    ("21:52.01", V("px_orca", 40, ov=ST_("KING OF THE SURFACE", "21:52.83"))),
    ("21:54.84", A("descend", ov=ST_("THE DEEP HAS HAD A KING ALL ALONG", "21:55.84"))),
    ("21:57.92", lambda a, b: (anim(a, b, "rise", depth0=0.8, depth1=0.85, start=1200, end=900), layer(a, b, endcard(a, b, s("21:58.31"))))),
]

CSS = open(H / "style.css", encoding="utf-8").read()
IMGS = {"img_sperm": "il_sperm", "img_orca": "il_orca", "img_blue": "il_blue", "img_hump": "il_hump", "img_gray": "il_gray", "img_squid": "squid_3d", "img_shark": "il_shark"}


FAMILY = {"water_whoosh": ("swell", 6, 30), "deep_boom": ("boom", 4, 20), "drone_swell": ("drone", 3, 40), "bubbles": ("bubbles", 3, 15),
          "sonar_ping": ("sonar", 3, 0), "thud": ("thud", 3, 0), "wave": ("wave", 1, 0)}


def vary(cues):
    """Different take each time, never the same take twice in a row, and the same family no closer than its gap."""
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
    ROT.clear()
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
<script src="assets/js/ocean.js"></script><script src="assets/js/scenes.js"></script>
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
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(4)
    sfx_cues.clear()
    for k in ks: write_part(k)
    if len(ks) == 4:
        json.dump(vary(sorted(sfx_cues)), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        print(len(sfx_cues), "sound cues")
