"""Outside Lay EP1: Saturn's rings are disappearing. Writes parts/p1..p4.html, sfx.json, usage.json.
Voice public/voice.mp3 (923.66 s). 3D shots are drawn by assets/js/space.js; 2D scenes in scenes2d.py."""
import json, sys
from lib import *
from scenes2d import *

END = 923.66
CSS = open(H / "style.css", encoding="utf-8").read()


def I(name, w_=900, h_=900, crop=None):
    """Image path for lenses/cards; a navy placeholder if the image is not downloaded (reported)."""
    try: return fitted(name, w_, h_, crop)
    except AssertionError:
        print("MISSING image", name)
        return gen_img("missing.jpg", lambda out: Image.new("RGB", (64, 64), (20, 30, 60)).save(out))


# ---------------- shot builders ----------------
def G(kind, ov=None, **o):
    def f(a, b, **_):
        G3(a, b, kind, **o)
        if ov: layer(a, b, ov(a, b), fin=0)
    f.k = "3d"; return f


def N(fn, *args, **kw):
    def f(a, b): return fn(a, b, *args, **kw)
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
def ST_(text, t, end=None, y=900, white=False, size=76): return lambda a, b: stmt(text, t, end, y, white, size)
def LB(text, t, x, y, end=None, white=False, size=24, anchor="left"): return lambda a, b: lab(text, t, x, y, end, white, size, anchor)
def BX(text, t, x, y, end=None, kind="", anchor="left"): return lambda a, b: box(text, t, x, y, end, kind, anchor)
def NM(n0, n1, unit, t, x=None, y=880, count=1.2, end=None, dec=0, prefix="", suffix="", size=96): return lambda a, b: num(n0, n1, unit, t, x, y, count, end, dec, prefix, suffix, size)
def HD(text, t=None): return lambda a, b: hdr(text, t if t is not None else a + 0.1)
def LN(img, t, x, y, r, end=None): return lambda a, b: lens(t, x, y, r, I(img), end)
def FX(name, t, vol=1.0):
    def f(a, b): sfx(name, t, vol); return ""
    return f


# Saturn camera presets
SUN = [-62, 12]
def SAT(**o): return G("sat", sun=o.pop("sun", SUN), **o)


t = lambda word, after: w(word, after)   # shorthand

SHOTS = [
    # ================= HOOK =================
    ("0:00.00", SAT(dist=7.5, elK=[[0, 14], [3.4, 0.25]], az0=-8, az1=4, roll=-6, ov=OV(lambda a, b: (tw("#fadein0", {"opacity": 0}, 0.0, 1.4, {"opacity": 1}, "power1.inOut") or "") + '<div id="fadein0" class="black"></div>',
                                                                     ST_("MARCH 2025", 0.6, 3.5, 900, True, 70), FX("boom", 0.2, 0.7)))),
    ("0:03.76", VD("px_telescope_2", 1, ov=LB("TELESCOPES ON EARTH", 4.2, 60, 1000, white=True))),
    (t("found", 3.76), SAT(dist=6.4, dist1=5.6, el=0.12, az0=-4, az1=4, sun=[-50, 6], ov=OV(
        LB("A PALE YELLOWISH BALL", t("pale", 8.6), 960, 780, None, True, 24, "center"),
        LB("← WHERE THE RINGS USED TO BE", t("scratch", 8.6), 1350, 530, None, False, 22), LN("hubble_rpx3", t("famous", 8.6), 1600, 260, 190),
        LB("HUBBLE · RINGS EDGE-ON", t("famous", 8.6) + 0.3, 1600, 470, None, True, 18, "center")))),
    ("0:16.80", SAT(dist=6.2, elK=[[0, 0.15], [2.6, 0.15], [7.0, 9]], az0=0, az1=14, roll=-4, ov=OV(
        ST_("AN ILLUSION", t("illusion", 19.4), "0:23.6", 900, False, 80), LB("THE RINGS ARE COMING BACK", t("coming", 19.4), 960, 1000, None, True, 24, "center")))),
    ("0:23.82", SAT(dist=5.2, dist1=4.6, el=11, az0=30, az1=40, sun=[-120, 8], roll=-10, ov=OV(
        ST_("THE RINGS REALLY ARE DISAPPEARING", t("really", 28.1), "0:31.3", 900, False, 70), FX("boom", t("really", 28.1), 0.6)))),
    ("0:31.40", G("sat_rain", dist=4.4, dist1=4.0, el=12, az0=10, az1=22, sun=[-55, 14], lt0=0.2, tg=0.8, grains=1400, ov=OV(
        LB("SATURN IS EATING THEM", t("eating", 31.4), 60, 980, None, True), NM(0, 1, "TONS EVERY SECOND", t("tons", 31.4), 60, 880, 0.1, None, 0, "", "+", 80)))),
    ("0:38.84", PH("rings_closeup", zoom=(1.0, 1.12), ov=ST_("HOW LONG DO THEY HAVE LEFT?", t("measured", 38.8), None, 900, True, 70))),
    ("0:43.72", N(two_questions, t("why", 46.0), t("why", 49.0))),
    ("0:51.76", N(three_teasers, [t("moon", 51.7), t("spacecraft", 51.7), t("argument", 51.7)], [I("mimas"), I("cassini_art"), I("cassini_equinox")],
                  ["A MOON THAT MAY HAVE DIED", "A SPACECRAFT THAT DESTROYED ITSELF", "A SPLIT IN PLANETARY SCIENCE"])),
    ("1:02.88", SAT(distK=[[0, 46], [5.5, 7.5]], el0=28, el1=16, az0=70, az1=18, roll=-8, ease="out", ov=OV(HD("SATURN", 63.6), FX("whoosh", 62.9, 0.8)))),
    # ================= SIZE =================
    ("1:09.50", G("row", items=[{"k": "saturn", "r": 1, "x": -1.0}, {"k": "earth", "r": 0.106, "x": 3.1, "rot0": 2}], dist=10.5, cx0=0.9, cx1=1.1, cy=1.3, sunV=[-1, 0.3, 0.8],
                  ov=OV(LB("SATURN", 70.0, 500, 790, None, True, 26, "center"), LB("EARTH", 70.6, 1440, 590, None, True, 22, "center"),
                        NM(1, 9.5, "TIMES WIDER", t("9", 69.5), 1150, 820, 1.0, None, 1, "", "×")))),
    ("1:12.80", G("earths", fill0=0.6, fillT=5.5, dist0=4.6, dist1=4.0, el=14, az0=-10, az1=12, sx=-260, solid=[[0, 0], [8.5, 0], [9.4, 1]],
                  ov=OV(HD("HOW MANY EARTHS?"), NM(0, 760, "EARTHS FIT INSIDE", t("760", 72.8), 1080, 860, 1.4)))),
    ("1:24.82", N(mass_bars, 85.1, t("95", 84.8), "1:28.66")),
    ("1:32.04", N(float_tub, t("float", 92.0))),
    # ================= RING SIZE =================
    ("1:38.38", SAT(dist0=5.2, dist1=3.9, el0=30, el1=13, az0=-36, az1=8, sx=120, roll=-8, ov=HD("THE RINGS"))),
    ("1:43.18", N(ring_span, t("280", 103.1), t("Earth", 108.8))),
    ("1:53.14", N(thickness, t("three", 113.1))),
    ("2:00.54", SAT(dist=5.5, el0=3.5, el1=1.2, az0=-8, az1=0, sun=[-40, 10], ov=ST_("WIDTH VS THICKNESS", 121.0, None, 900, True, 64))),
    ("2:03.00", VD("px_football_1", 0, ov=ST_("SHRINK THE RINGS TO A FOOTBALL FIELD", 123.3, None, 880, False, 64))),
    (t("they'd", 123.0), VD("px_hair_1", 0, ov=NM(1, 20, "TIMES THINNER THAN A HUMAN HAIR", t("20", 126.0), None, 860, 0.9, None, 0, "", "×", 110))),
    ("2:10.06", G("fly", speed=2.2, y=0.35, ov=OV(ST_("NOT SOLID", 130.4, "2:14.5", 900, True, 80), ST_("NOT EVEN ONE RING", t("even", 132.3), "2:14.6", 980, False, 54),
                                                LB("BILLIONS OF SEPARATE PIECES", t("billions", 134.6), 60, 980, None, True)))),
    (t("everything", 134.6), G("fly", speed=1.6, y=1.4, look=0.25, z=-30, ov=OV(LB("ALMOST PURE WATER ICE", t("water", 134.6) - 2, 60, 60, None, True),
                                                                              BX("GRAINS SMALLER THAN SAND", t("grains", 134.6), 60, 880), BX("CHUNKS THE SIZE OF A MOUNTAIN", t("mountain", 134.6), 60, 940, None, "v"),
                                                                              ST_("AN INCREDIBLY FLAT DISK", t("flat", 134.6), None, 900, False, 64)))),
    ("2:27.16", N(ring_letters, {"D": t("D", 149.4), "C": t("C", 150.5), "B": t("B", 151.0), "A": t("A", 151.6), "F": t("F", 152.0), "G": t("G", 152.4), "E": t("faint", 153.0)}, "2:40.50")),
    ("2:46.62", SAT(dist0=11, dist1=9.5, el=16, az0=20, az1=34, moons=[{"k": "mimas", "r": 0.033, "a": 3.08, "ph": 200, "sp": 6}], ov=HD("THE WEIGHT OF THE RINGS"))),
    ("2:49.72", N(mimas_mass, t("Mimas", 169.7), t("40", 169.7), I("mimas", 700, 700))),
    ("3:03.22", PH("cassini_equinox", zoom=(1.0, 1.1), ov=LB("CASSINI · SATURN AT EQUINOX", 183.6, 60, 1010, None, True, 20))),
    ("3:12.50", SAT(dist=6.8, elK=[[0, 12], [4.3, 0.5]], az0=-10, az1=0, ov=ST_("THAT THINNESS IS WHY THEY VANISH", 193.0, None, 900, True, 64))),
    # ================= GALILEO =================
    ("3:16.88", PH("galileo_portrait", mode="card", bg="navy", maxh=820, zoom=(1.0, 1.04), ov=OV(HD("THE FIRST TO NOTICE"), LB("GALILEO GALILEI", 197.6, 960, 990, None, True, 26, "center")))),
    ("3:20.24", PH("galileo_sketch", mode="card", bg="navy", maxh=700, zoom=(1.0, 1.05), ov=OV(HD("1610"), LB("TWO STRANGE LUMPS", t("lumps", 200.2), 960, 990, None, False, 26, "center")))),
    ("3:27.92", SAT(dist=34, el=6, az=0, ov=OV(LB("TWO GIANT MOONS?", 208.4, 960, 760, None, True, 26, "center")))),
    ("3:31.18", SAT(dist=34, el0=2.0, el1=0.1, az=0, ov=OV(HD("1612"), LB("THE LUMPS WERE GONE", t("gone", 211.1), 960, 760, None, False, 26, "center")))),
    ("3:38.56", PH("saturn_devouring", zoom=(1.0, 1.12), origin="50% 35%", ov=OV(LB("SATURN DEVOURING HIS SON · RUBENS", 219.0, 60, 1010, None, True, 20),
                                                                                 ST_("DID SATURN EAT ITS CHILDREN?", t("wondered", 218.5), None, 880, False, 64)))),
    ("3:48.96", SAT(dist=34, el0=0.2, el1=7, az=0, ov=OV(LB("A FEW YEARS LATER: BACK", 229.4, 960, 760, None, True, 26, "center")))),
    ("3:51.28", PH("huygens_portrait", mode="card", bg="navy", maxh=820, zoom=(1.0, 1.04), ov=OV(HD("1650s"), LB("CHRISTIAAN HUYGENS", 231.8, 960, 990, None, True, 26, "center")))),
    ("3:59.76", PH("huygens_systema", mode="card", bg="navy", maxh=820, maxw=1600, zoom=(1.0, 1.05), ov=LB("A THIN, FLAT RING THAT TOUCHES NOTHING", 240.3, 960, 1000, None, False, 24, "center"))),
    ("4:04.88", SAT(dist=6.2, el0=2.5, el1=0.15, az0=6, az1=-2, ov=OV(ST_("THE FIRST RING PLANE CROSSING", t("ring", 245.5), None, 900, False, 66)))),
    # ================= CROSSING =================
    ("4:12.98", N(tilt, t("27", 254.4))),
    ("4:20.72", N(orbit_view, t("29", 260.7), t("13", 278.0), t("down", 270.8), t("up", 274.0))),
    ("4:46.04", SAT(dist=7.5, el=0.25, az0=-3, az1=3, ov=OV(LB("10 M THICK", 287.5, 1450, 470, None, False, 24), NM(0, 1.2, "BILLION KM AWAY", t("billion", 286.0), None, 860, 1.0, None, 1, "", "", 90)))),
    ("4:53.02", VD("px_paper_0", 0, ov=ST_("A SHEET OF PAPER, SIDEWAYS, FROM ACROSS A COUNTRY", 293.6, None, 880, False, 56))),
    ("5:02.62", N(crossings, [t("2009", 302.6), t("23", 302.6), t("2030s", 308.7), t("2038", 315.7)])),
    ("5:25.08", SAT(dist0=8, dist1=7, el=22, az0=-40, az1=-20, roll=-14, ov=OV(LB("REAL · SPECTACULAR · HARMLESS", t("real", 327.0), 960, 960, None, True, 26, "center")))),
    ("5:31.22", SAT(dist=4.2, el=6, az0=160, az1=170, sun=[178, 5], ov=OV(ST_("THE SECOND ONE ISN'T", 331.5, None, 900, False, 76), FX("boom", 331.4, 0.8)))),
    # ================= RING RAIN =================
    ("5:32.98", PH("voyager_saturn", zoom=(1.0, 1.1), ov=OV(HD("THE FIRST CLUES"), LB("VOYAGER · 1980–81", t("1980", 336.1), 60, 1010, None, True, 22)))),
    ("5:44.22", SAT(dist=2.9, dist1=2.6, el=14, az0=-6, az1=6, sx=-200, rot=4, ov=OV(BX("DARK BANDS IN THE ATMOSPHERE", t("dark", 344.2), 1180, 360),
                                                                                     BX("ODD CHANGES IN THE IONOSPHERE", t("electrically", 344.2), 1180, 440, None, "v"),
                                                                                     BX("DENSITY VARIATIONS IN THE RINGS", t("density", 344.2), 1180, 520)))),
    ("5:56.06", N(namecard, "1986", "JACK CONNERNEY", "A NEW IDEA", 357.0, "THE RINGS ARE RAINING ONTO SATURN", t("raining", 362.1))),
    ("6:05.80", N(charging, t("ultraviolet", 370.0), t("micrometeoroids", 370.0), t("electrons", 379.7), t("charge", 379.7), t("magnetic", 390.1))),
    ("6:33.04", G("sat_rain", dist=6, el=12, az0=-10, az1=8, lt0=0.4, tg=2.4, ov=OV(LB("MAGNETIC FIELD LINES", 393.6, 60, 1000, None, False), LB("LIKE BEADS ON A CURVED WIRE", t("beads", 393.0), 960, 1000, None, True, 24, "center")))),
    ("6:44.18", G("sat_rain", dist=4.6, el=24, az0=40, az1=52, lt0=0, tg=0, grains=1600, ov=OV(ST_("RING RAIN", t("ring", 404.1), None, 880, False, 90), LB("IT GLOWS IN INFRARED", t("infrared", 404.1), 960, 990, None, True, 24, "center")))),
    ("6:54.94", PH("keck_obs", zoom=(1.0, 1.1), ov=OV(BX("JAMES O'DONOGHUE · NASA", 415.4, 60, 940), LB("KECK TELESCOPE · HAWAII", t("Keck", 419.0), 60, 1010, None, True, 20),
                                                     LN("ringrain_keck", t("glowing", 419.0), 1460, 470, 300), LB("ARTIST'S CONCEPT · NASA", t("glowing", 419.0) + 0.3, 1460, 800, None, True, 18, "center")))),
    ("7:08.56", VD("px_pool_1", 0, ov=OV(NM(1, 3, "TONS OF WATER EVERY SECOND", t("1", 428.5), None, 380, 0.8, None, 0, "1–", "", 120),
                                         LB("AN OLYMPIC POOL IN ABOUT HALF AN HOUR", t("Olympic", 428.5), 960, 560, None, True, 28, "center")))),
    ("7:16.76", SAT(dist=7.2, el=18, az0=-12, az1=4, drainK=[[2.5, 0], [7.4, 2.3]], ov=NM(0, 300, "MILLION YEARS LEFT", t("300", 436.7), None, 880, 1.2))),
    ("7:24.36", G("cassini", az0=20, az1=60, dist0=16, dist1=12, ov=OV(HD("CASSINI"), ST_("RING RAIN WAS ONLY HALF THE STORY", t("half", 444.3), None, 900, True, 60)))),
    # ================= CASSINI =================
    ("7:28.86", PH("cassini_launch", zoom=(1.0, 1.1), ov=OV(BX("LAUNCH · 1997", t("launched", 448.8), 60, 920), BX("ARRIVAL · 2004", t("2004", 448.8), 60, 980, None, "v")))),
    (t("spent", 448.8), G("cassini", az0=-40, az1=-10, dist=11, cy=1, ov=NM(0, 13, "YEARS ORBITING SATURN", t("13", 448.8), 60, 880, 0.8))),
    ("7:37.42", SAT(dist=5.5, el=10, az0=90, az1=100, sun=[-30, 8], ov=OV(LB("2017 · RUNNING OUT OF FUEL", 458.0, 60, 1000, None, True)))),
    ("7:42.04", N(lenses, "PLACES TO LOOK FOR LIFE", [(I("enceladus", 700, 700), "ENCELADUS", t("Enceladus", 462.0)), (I("titan", 700, 700), "TITAN", t("Titan", 462.0))])),
    ("7:48.94", PH("cassini_art", zoom=(1.0, 1.08), ov=ST_("IT COULD CONTAMINATE THEM FOREVER", t("contaminate", 469.0), None, 900, False, 64))),
    ("7:56.24", G("cassini", az0=150, az1=190, dist=13, cy=-1, ss=12, sp=[10, -2, -36], ov=ST_("SO CASSINI WOULD DIVE INTO SATURN", 477.0, None, 900, True, 60))),
    ("8:01.20", G("sat_orbits", dist0=22, dist1=18, el=22, az0=20, az1=40, lt0=0.4, ldur=9, ov=OV(HD("THE GRAND FINALE", t("Grand", 485.8)), NM(0, 22, "DIVES THROUGH THE GAP", t("22", 485.8), 60, 880, 1.0)))),
    (t("narrow", 485.8), N(gap, t("2400", 485.8), t("100", 497.8))),
    ("8:22.04", PH("grand_finale_art", zoom=(1.0, 1.1), ov=OV(ST_("WHAT IT FOUND SHOCKED THE TEAM", 502.3, None, 900, True, 60)))),
    ("8:24.24", G("sat_pour", dist0=3.4, dist1=2.9, el=9, az0=-30, az1=-10, sx=-150, grains=3000, ov=OV(LB("POURING STRAIGHT INTO SATURN'S EQUATOR", t("pouring", 504.2), 960, 980, None, True, 24, "center"),
                                                                  NM(0, 10, "TONS EVERY SECOND", t("10", 504.2), None, 860, 1.0)))),
    ("8:34.84", N(chem_list, [("WATER", 515.0), ("METHANE", t("methane", 516.5)), ("AMMONIA", t("ammonia", 516.5)), ("CARBON MONOXIDE", t("monoxide", 516.5) - 0.4),
                              ("CARBON DIOXIDE", t("dioxide", 516.5) - 0.4), ("COMPLEX ORGANICS", t("organic", 516.5) - 0.3)])),
    ("8:45.14", VD("px_downpour_1", 0, ov=ST_("NOT RING RAIN: A RING DOWNPOUR", t("downpour", 525.1), None, 880, False, 70))),
    ("8:51.16", N(lifetime_bars, [("RING RAIN ALONE", 300, VIOLET, 531.5), ("RAIN + DOWNPOUR", 100, PINK, t("100", 531.1))], "TIME LEFT")),
    ("8:57.12", PH("cassini_plunge_art", zoom=(1.0, 1.12), ov=OV(BX("SEPTEMBER 15, 2017", 537.5, 60, 940), LB("SENDING DATA TO THE LAST SECOND", t("sending", 537.1), 60, 1010, None, True, 20)))),
    (t("burned", 537.1), VD("px_meteor_0", 0)),
    # ================= FUTURE =================
    ("9:07.98", SAT(dist=7, el=17, az0=-20, az1=0, drainK=[[t("drain", 552) - 548, 0], [t("drain", 552) - 545, 1.65], [t("B", 556) - 548, 1.65], [12.1, 1.95]],
                    ov=OV(HD("WHAT WILL IT LOOK LIKE?"), BX("D RING", t("D", 552.0), 1500, 300), BX("C RING", t("C", 552.0), 1500, 360), BX("B RING", t("B", 556.0), 1500, 420, None, "v"),
                          BX("A RING", t("A", 557.0), 1500, 480, None, "v")))),
    ("9:20.12", SAT(dist=7.6, el=17, az0=0, az1=12, drain=1.95, ringOpK=[[0, 1], [7, 0.12]], ov=OV(LB("FAINT, DUSTY RINGLETS", t("faint", 560.1), 960, 980, None, True, 24, "center")))),
    ("9:28.56", N(uncertain, [("IS THE RAIN CONSTANT?", t("constant", 572.0)), ("DOES IT CHANGE WITH THE SEASONS?", t("seasons", 572.0)),
                              ("IS ANYTHING REFILLING THE RINGS?", t("refilling", 572.0)), ("SOMETHING IS.", t("actually", 578.0))])),
    ("9:42.28", PH("enceladus_plumes", mode="card", bg="navy", maxh=820, zoom=(1.0, 1.06), ov=OV(BX("ENCELADUS", 582.8, 60, 940), LB("GEYSERS OF ICE FROM THE SOUTH POLE", t("geysers", 582.2), 60, 1010, None, True, 20)))),
    (t("spray", 582.2), PH("e_ring", mode="card", bg="navy", maxh=820, zoom=(1.0, 1.06), ov=LB("THE E RING · FED BY A LIVING MOON", t("spray", 582.2) + 0.4, 60, 1010, None, False, 22))),
    ("9:55.34", SAT(dist=8, el=20, az0=40, az1=56, ov=ST_("THE MAIN RINGS: ONLY LOSING MATERIAL", t("losing", 595.3), None, 900, False, 60))),
    # ================= AGE =================
    ("10:03.12", SAT(dist0=6, dist1=5, el=8, az0=-60, az1=-46, sun=[-90, 10], ov=ST_("HOW OLD ARE THE RINGS?", 606.0, None, 900, True, 76))),
    ("10:09.38", N(bignum, "SATURN", 0, 4.5, "BILLION YEARS OLD", 610.0, 1, "", "", "COULD THE RINGS LAST THAT LONG?", 613.5)),
    ("10:19.52", SAT(dist=5.4, el=26, az0=10, az1=24, dirtK=[[2.5, 0], [10.5, 0.85]], ov=OV(HD("ANOTHER CLUE"), LB("DARK DUST FROM DEEP SPACE", t("dark", 620.9), 60, 1000, None, True),
                                                                                         ST_("THE RINGS SHOULD BE GREY", t("gray", 620.9) - 0.6, None, 900, False, 60)))),
    ("10:31.24", SAT(dist=5.4, el=26, az0=24, az1=30, dirtK=[[0, 0.85], [1.4, 0]], ov=ST_("BUT THEY'RE STILL BRIGHT", 631.5, None, 900, True, 66))),
    (t("snow", 631.2), VD("px_snow_1", 0)),
    ("10:37.84", N(namecard, "2023", "SASCHA KEMPF", "CASSINI'S DUST DETECTOR", t("dust", 637.8))),
    ("10:48.02", N(deep_time, [(400, "RINGS: NO OLDER THAN THIS", NEON, 649.0, 1), (450, "SHARKS", PINK, t("sharks", 653.0), 0)], "HOW YOUNG?")),
    ("11:01.14", PH("dinosaur", mode="card", bg="navy", maxh=700, zoom=(1.0, 1.05), ov=OV(LB("EARLY DINOSAURS", 661.6, 60, 1010, None, True, 22), ST_("A SKY WHERE SATURN HAD NO RINGS?", t("sky", 661.1), None, 880, False, 60)))),
    # ================= CHRYSALIS =================
    ("11:07.38", SAT(dist=9, el=14, az0=-30, az1=-10, ov=ST_("SO WHERE DID THEY COME FROM?", 667.6, None, 900, True, 66))),
    ("11:09.68", N(namecard, "2022", "JACK WISDOM", "MIT", 670.5)),
    ("11:16.04", G("body", k="saturn", p={"rings": False}, dist=10, el=14, az0=10, az1=30, sats=[{"k": "titan", "r": 0.09, "a": 5.2, "ph": 30, "sp": 4}, {"k": "chrysalis", "r": 0.06, "a": 3.2, "ph": 200, "sp": 9}],
                   ov=OV(BX("CHRYSALIS", t("Chrysalis", 676.0), 1400, 380), LB("A LOST MOON", t("moon", 676.0), 1400, 440, None, True)))),
    ("11:21.24", G("body", k="saturn", p={"rings": False}, dist=10, el=30, az0=60, az1=80, sats=[{"k": "titan", "r": 0.09, "a": 5.2, "ph": 60, "sp": 6},
                                                                                                {"k": "chrysalis", "r": 0.06, "aK": [[0, 3.2], [2, 3.8], [3.5, 2.6], [5, 3.6], [6.5, 2.2], [7.9, 3.0]], "ph": 240, "sp": 26}],
                   ov=OV(LB("TITAN'S GRAVITY", t("Titan", 681.2), 60, 940, None, True), BX("A CHAOTIC ORBIT", t("chaotic", 681.2), 60, 1000, None, "p")))),
    ("11:29.16", G("breakup", k="saturn", m="chrysalis", mr=0.13, a0=3.4, rb=1.7, tBreak=t("torn", 689.1) - 689.16, spread=0.9, fallFrac=0.7, formRing=True, ringAt=11.5,
                   dist0=8.5, dist1=7.0, el0=24, el1=16, az0=-20, az1=20, n=10000,
                   ov=OV(NM(0, 160, "MILLION YEARS AGO", 689.6, 60, 880, 1.2), LB("MOST FELL INTO SATURN", t("fell", 696.2), 60, 1000, 701.5, True, 24),
                         ST_("THAT DISC BECAME THE RINGS", 702.5, None, 900, False, 66), FX("boom", t("torn", 689.1), 0.7)))),
    ("11:45.14", VD("px_butterfly_0", 0)),
    ("11:50.50", SAT(dist=6.6, el=19, az0=-24, az1=-8, roll=-10, ov=ST_("THE RINGS ARE THE BUTTERFLY", 711.0, None, 900, False, 72))),
    ("11:54.08", N(tilt, t("27", 714.0))),
    ("12:05.78", N(listcard, "THE YOUNG RINGS THEORY", [("A DEAD MOON", t("dead", 727.9)), ("A RECENT DISASTER", t("recent", 727.9)), ("YOUNGER THAN THE DINOSAURS", t("younger", 727.9)),
                                                         ("A SHORT LIFE", t("short", 727.9))], ["", "v", "", "p"])),
    # ================= HYODO =================
    ("12:15.36", SAT(dist=6.5, el=16, az0=0, az1=10, roll0=0, roll1=180, ease="inout", ov=OV(BX("DECEMBER 2024", 735.8, 60, 940), LB("THE DEBATE, UPSIDE DOWN", t("upside", 735.4), 60, 1010, None, True)))),
    ("12:21.62", N(namecard, "2024", "RYUKI HYODO", "INSTITUTE OF SCIENCE TOKYO", 742.6, "COMPUTER SIMULATIONS OF IMPACTS", t("simulations", 741.6))),
    ("12:32.62", G("impact", tHit=t("slam", 752.6) - 752.62 + 0.4, ov=OV(ST_("INCREDIBLY VIOLENT", 753.0, None, 900, True, 70), NM(0, 20, "KM PER SECOND", t("20", 755.9), 60, 120, 1.0)))),
    ("12:43.16", G("impact", tHit=0.5, dist0=8, dist1=9.5, ov=OV(LB("THEY VAPORISE INTO PLASMA", 763.6, 60, 60, None, True), NM(0, 10000, "°C", t("10", 763.1), 60, 880, 1.2),
                                                             LB("CHARGED PARTICLES: INTO SATURN OR OUT TO SPACE", t("charged", 767.7), 960, 1010, None, False, 22, "center")))),
    ("12:54.88", SAT(dist=6, el=24, az0=-20, az1=-6, ov=ST_("THE RINGS MAY KEEP THEMSELVES CLEAN", 775.3, None, 900, False, 62))),
    ("13:00.36", G("fly", speed=1.4, y=0.9, look=0.15, z=-60, ov=OV(LB("BRIGHT DOESN'T MEAN YOUNG", 781.0, 60, 60, None, True), NM(0, 4.5, "BILLION YEARS OLD?", t("four", 784.7), None, 860, 1.2, None, 1)))),
    ("13:11.34", G("sat_rain", dist=5, el=16, az0=-30, az1=-16, lt0=0, tg=0, ov=LB("FEEDING THE RING RAIN TOO?", 792.0, 60, 1000, None, True))),
    ("13:18.10", N(debate, t("Kem", 799.9), t("new", 799.9), t("open", 799.9))),
    ("13:34.32", SAT(dist=7.5, el=15, az0=-6, az1=10, ringOpK=[[3, 1], [7, 0.55]], ov=ST_("ONE DAY SATURN WILL LOOK VERY DIFFERENT", t("someday", 814.3), None, 900, True, 58))),
    # ================= GIANTS =================
    ("13:41.18", SAT(dist=4.6, el=9, az0=120, az1=132, sun=[-150, 8])),
    ("13:43.52", G("row", items=[{"k": "jupiter", "r": 1.0, "x": -3.6, "p": {"faintRing": 0.25}, "from": t("Jupiter", 826) - 823.52},
                                 {"k": "saturn", "r": 0.84, "x": -0.6},
                                 {"k": "uranus", "r": 0.36, "x": 1.9, "tilt": 98, "p": {"faintRing": 0.4}, "from": t("Uranus", 826) - 823.52},
                                 {"k": "neptune", "r": 0.35, "x": 3.4, "p": {"faintRing": 0.3}, "from": t("Neptune", 826) - 823.52}],
                   dist=11.5, cy=1.2, cx=-0.1, ov=OV(HD("EVERY GIANT PLANET HAS RINGS"), LB("JUPITER", t("Jupiter", 826), 330, 800, None, True, 22, "center"),
                                                     LB("URANUS", t("Uranus", 826), 1300, 680, None, True, 20, "center"), LB("NEPTUNE", t("Neptune", 826), 1600, 680, None, True, 20, "center")))),
    ("13:51.00", N(lenses, "THIN, DARK AND FAINT", [(I("jupiter_rings", 700, 700), "JUPITER · FOUND 1979", 831.4), (I("uranus_rings", 700, 700), "URANUS · FOUND 1977", 832.4),
                                                     (I("neptune_rings", 700, 700), "NEPTUNE · CONFIRMED 1989", 833.4)])),
    ("13:57.18", N(namecard, "AN IDEA", "JAMES O'DONOGHUE", "THE SCIENTIST WHO MEASURED RING RAIN", 838.0)),
    ("14:02.98", G("body", k="jupiter", p={"bigRing": True}, dist=7.5, el=14, az0=-20, az1=0, ringOpK=[[0, 0], [2.2, 1]], rot=3,
                   ov=ST_("DID WE SHOW UP TOO LATE?", t("late", 843.0), None, 900, True, 66))),
    ("14:09.93", G("body", k="mars", dist=5.2, el=8, az0=-20, az1=-4, sats=[{"k": "phobos", "r": 0.06, "aK": [[0, 2.9], [10, 2.5]], "ph": 260, "sp": 14, "p": {"lumpy": True}}],
                   ov=OV(HD("MARS"), BX("PHOBOS", t("Phobos", 851.7), 1400, 360), LB("SPIRALLING INWARD", t("spiraling", 851.7), 1400, 420, None, True)))),
    ("14:19.80", G("breakup", k="mars", m="phobos", mp={"lumpy": True}, mr=0.07, a0=2.5, rb=1.5, rIn=1.25, rOut=1.9, tBreak=2.5, spread=1.2, pcol=0xb9a89a,
                   dist0=6, dist1=5.2, el0=20, el1=12, az0=10, az1=30, n=7000,
                   ov=OV(NM(30, 50, "MILLION YEARS FROM NOW", t("30", 859.8), 60, 880, 0.8, None, 0, "30–"), ST_("THE NEXT RINGED PLANET: MARS?", t("ringed", 868.8), None, 900, False, 64)))),
    # ================= ENDING =================
    ("14:36.30", SAT(dist=7, el=16, az0=-10, az1=4, ringOpK=[[3.9, 1], [5.9, 0], [7.2, 0], [9.5, 1], [11.5, 1], [12.0, 1]], ov=OV(ST_("RINGS AREN'T PERMANENT", 876.6, "14:40.0", 900, True, 66),
                                                                                                                              ST_("THEY'RE MORE LIKE SEASONS", t("seasons", 880.1), None, 900, False, 72)))),
    ("14:48.34", PH("cassini_backlit", zoom=(1.0, 1.12), ov=ST_("WE'RE ALIVE DURING THE BRIEF WINDOW", t("window", 888.3), None, 900, True, 58))),
    ("14:59.24", SAT(dist0=9, dist1=6.8, el=19, az0=-30, az1=-14, roll=-12, ov=ST_("ENJOY THE VIEW WHILE IT LASTS", t("enjoy", 899.2), None, 900, False, 70))),
    ("15:06.98", N(lambda a, b: navy(a, b) + hdr("UP NEXT", a + 0.1) + lens(a + 0.3, 560, 500, 260, I("enceladus", 800, 800)) +
                   lab("A MOON WITH AN OCEAN UNDER ITS ICE", a + 0.6, 560, 790, None, True, 22, "center") +
                   f'<div style="position:absolute;left:1110px;top:300px;width:620px;height:400px;border:4px dashed {RING}"></div>' +
                   stmt("OUTSIDE LAY", s("15:18.10"), None, 870, False, 120))),
]


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
        if fn.k == "3d":
            fn(a, b)
            continue
        if last_in_part: bx, fout = min(b, p1), 0.0
        elif nxt is not None and nxt.k == "3d": bx, fout = b + 0.3, 0.55
        else: bx, fout = b + 0.5, 0.0
        fin = 0.0 if abs(a - p0) < 0.05 and k else 0.45
        if fn.k == "vid" and not os.path.exists(src_path(fn(a, b)[1])):
            print("MISSING clip", fn(a, b)[1]); _, src, ss, kw, ov = fn(a, b)
            layer(a, bx, navy(a, bx) + (ov(a, bx) if ov else ""), fin=fin, fout=fout)
        elif fn.k == "vid":
            _, src, ss, kw, ov = fn(a, bx)
            ST["n"] += 1
            if not ST["skip"]:
                wid, v = nid("w"), nid("v")
                clip = trim(src, ss, bx - a, kw.get("speed", 1.0), kw.get("crop"), kw.get("grade", ""))
                html.append(f'<div id="{wid}" class="vw" style="left:0;top:0;width:1920px;height:1080px;z-index:{ST["n"]}"><video id="{v}" class="clip fit" src="{clip}" muted playsinline '
                            f'data-start="{T(a)}" data-duration="{bx - a:.3f}" data-track-index="1"></video></div>')
                z = kw.get("zoom", (1.0, 1.07)); tw(f"#{v}", {"scale": z[1]}, a, bx - a, {"scale": z[0]}, "none")
                if fin: tw(f"#{wid}", {"opacity": 1}, a, fin, {"opacity": 0}, "power1.inOut")
                if fout: tw(f"#{wid}", {"opacity": 0}, bx - fout, fout, None, "power1.inOut")
            if ov: layer(a, bx, '<div class="shade"></div>' + ov(a, bx), fin=fin, fout=fout)
        else:
            inner = fn(a, bx)
            layer(a, bx, inner, fin=fin, fout=fout)
            if prv is not None and prv.k == "3d" and fn.k == "2d": sfx("whoosh", a - 0.15, 0.45)
    ST["skip"] = False
    dur = p1 - p0
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


PARTS = [0.0, s("3:59.76"), s("8:01.20"), s("11:45.14"), END]

if __name__ == "__main__":
    for i in range(1, len(SHOTS)):
        assert s(SHOTS[i][0]) > s(SHOTS[i - 1][0]), f"shot order {SHOTS[i - 1][0]} -> {SHOTS[i][0]}"
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(4)
    sfx_cues.clear()
    for k in ks: write_part(k, PARTS)
    if len(ks) == 4:
        json.dump(sorted(sfx_cues), open(H / "sfx.json", "w"), indent=0)
        json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
        print(len(sfx_cues), "sound cues")
