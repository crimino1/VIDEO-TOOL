"""Outside Lay EP2: How Big Is Our Universe? Writes parts/p1..p3.html, sfx.json, usage.json, cues.txt.
Voice public/voice.mp3 (533.08 s). 3D shots: assets/js/space.js + kinds_ep2.js. 2D: scenes_ep2.py."""
import json, os, sys
from lib import *
from scenes2d import namecard, bignum, listcard, lenses
from scenes_ep2 import *

END = 533.08
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
SDO = "assets/img/sun_disk.png"
# gap camera: cx 192, cy 0, dist 421, fov 30 -> px = 960 + (x - 192) * 4.802
GPX = lambda x: int(960 + (x - 192) * 4.802)

SHOTS = [
    # ================= HOOK =================
    ("0:00.00", G("voyager", distK=[[0, 22], [7, 13]], az0=40, az1=20, cy=1.2, ov=OV(
        lambda a, b: (tw("#fadein0", {"opacity": 0}, 0.0, 1.6, {"opacity": 1}, "power1.inOut") or "") + '<div id="fadein0" class="black"></div>',
        ST_("NOVEMBER 18, 2026", 1.4, 6.6, 900, True, 66), FX("boom", 0.3, 0.6)))),
    ("0:07.00", PH("voyager_launch", zoom=(1.0, 1.1), origin="50% 40%", ov=LB("VOYAGER 1 · LAUNCHED 1977", 7.6, 60, 1010, None, True, 20))),
    (t("built", 7.0), VD("px_carkeys_0", 0, ov=ST_("LESS COMPUTING POWER THAN YOUR CAR KEYS", t("computing", 7.0), None, 880, False, 60))),
    (t("crossed", 7.0), G("voyager", dist0=12, dist1=10.5, az0=-30, az1=-18, cy=0.6, yaw=0.4, ov=LB("IT CROSSED AN INVISIBLE LINE", t("invisible", 7.0), 960, 960, None, True, 22, "center"))),
    ("0:16.00", VD("nasa_voyager_beauty4", 1.0, ov=OV(HD("VOYAGER 1", 16.4), LB("ANIMATION · NASA SVS", 16.5, 1860, 1010, None, True, 16, "right")))),
    (t("radio", 16.0), N(lightday, t("radio", 16.0) + 0.3, "0:25.04")),
    ("0:26.04", G("lightsys", voy=True, distK=[[0, 260], [5.9, 420]], el0=35, el1=28, az0=0, az1=8, ov=OV(
        LB("THE FARTHEST THING HUMANS HAVE EVER MADE", 26.6, 960, 960, None, True, 22, "center"), NM(0, 49, "YEARS OF FLYING", t("50", 26.0), 60, 120, 1.0, size=80)))),
    ("0:31.98", G("lightsys", voy=True, distK=[[0, 420], [5.8, 30000]], el=28, az=8, ease="in", ov=ST_("IT HASN'T EVEN LEFT THE DRIVEWAY", t("driveway", 31.9) - 0.6, None, 900, False, 64))),
    ("0:37.98", G("observable", dist0=170, dist1=150, el=14, cmb=IMGP("cmb_sphere"), cmbK=[[0, 0.45]], ov=OV(
        lambda a, b: stmt("HOW BIG IS OUR UNIVERSE?", 38.4, None, 460, True, 110), FX("boom", 38.0, 0.8)))),
    ("0:41.80", N(ladder, [("EARTH", t("Earth", 41.8)), ("MOON", 43.6), ("SUN", 44.2), ("STARS", 44.8), ("MILKY WAY", 45.4), ("GALAXIES", 46.0), ("LANIAKEA", 46.6), ("EVERYTHING WE CAN SEE", t("edge", 41.8))])),
    ("0:49.54", VD("px_lookup_0", 0, ov=ST_("YOU'LL NEVER SEE THE NIGHT SKY THE SAME WAY", 50.2, None, 880, True, 56))),
    # ================= EARTH =================
    ("0:54.76", G("earth", dist0=3.9, dist1=3.3, el=10, az0=-40, az1=-25, sun=[-65, 8], ov=OV(HD("STEP 1 · HOME"), NM(0, 12700, "KM WIDE", t("12", 56.6), 60, 880, 1.2)))),
    ("1:00.58", VD("px_highway_1", 0, ov=OV(ST_("NON-STOP, AT HIGHWAY SPEED", 61.2, None, 820, True, 56), NM(0, 2, "WEEKS TO DRIVE AROUND IT", t("two", 61.0), None, 900, 0.6, size=80)))),
    (t("enormous", 66.6) - 1.4, VD("px_mountains_0", 0, ov=ST_("TO US, IT FEELS ENORMOUS", 66.8, None, 900, True, 60))),
    (t("oceans", 69.2), VD("px_ocean_0", 0)),
    (t("8", 69.2), VD("px_crowd_0", 0, ov=NM(0, 8, "BILLION PEOPLE", t("8", 69.2), None, 880, 0.8))),
    ("1:14.92", PH("earth_moon", zoom=(1.0, 1.08), ov=LB("EARTH AND MOON · NASA DSCOVR", 75.5, 60, 1010, None, True, 20))),
    ("1:16.86", G("gap", cx=192, dist=421, cy=0, lineK=[[0, 0], [t("line", 82.9) - 76.86, 0], [t("Neptune", 88.6) - 76.86 + 1.4, 1]], ov=OV(
        HD("STEP 2 · THE MOON"), NM(0, 384400, "KM AWAY", t("384", 76.8), None, 880, 1.4),
        LB("EARTH", 77.4, GPX(0) + 20, 600, None, True, 18, "left"), LB("MOON", 77.4, GPX(384.4) - 10, 600, None, True, 18, "right")))),
    ("1:22.92", G("gap", cx=192, dist=421, cy=0, lineK=[[0, 0], [1.2, 0], [t("Neptune", 88.6) - 82.92 + 1.0, 1]], ov=OV(
        LB("MERCURY · VENUS · MARS", t("every", 82.9) + 1.2, GPX(20), 470, None, True, 16, "center"),
        LB("JUPITER", t("Jupiter", 88.6), GPX(102.7), 130, None, True, 20, "center"), LB("SATURN", t("Saturn", 88.6), GPX(225.4), 190, None, True, 20, "center"),
        LB("URANUS", t("Uranus", 88.6), GPX(306.1), 360, None, True, 18, "center"), LB("NEPTUNE", t("Neptune", 88.6), GPX(356.9), 640, None, True, 18, "center"),
        ST_("EVERY PLANET FITS IN THE GAP", t("fit", 88.6), None, 900, False, 64)))),
    ("1:38.30", G("gap", cx0=120, cx1=300, dist0=250, dist1=200, cy=10, ov=ST_("AND THAT'S THE SHORTEST TRIP", 98.8, None, 900, True, 60))),
    # ================= SUN =================
    ("1:41.32", G("sun", img=SDO, earthAt=[-150, 0, 40], lookK=[[-150, 0, 40], [-40, 0, 20]], distK=[[0, 9], [3.6, 640]], el=5, az=10, ease="inout", ov=OV(
        HD("STEP 3 · THE SUN"), NM(1, 109, "TIMES WIDER THAN EARTH", t("109", 103.4), None, 880, 1.2)))),
    ("1:47.12", G("sun", img=SDO, fill=1300000, earthAt=[-150, 0, 40], fillK=[[0, 0], [0.6, 0], [4.6, 1]], glassK=[[0, 0], [0.5, 1]], dist0=560, dist1=500, el=10, az0=10, az1=24, ov=OV(
        NM(0, 1300000, "EARTHS INSIDE", t("1", 107.1, prefix=True), None, 880, 2.0)))),
    ("1:52.62", N(massbar, 113.0, t("crumbs", 117.5))),
    ("2:04.64", VD("px_nightsky_0", 0, ov=ST_("EVEN THE SUN IS NOT SPECIAL", 125.0, None, 900, True, 60))),
    ("2:10.04", PH("orion_r", zoom=(1.0, 1.08), crop=(0.0, 0.32, 1.0, 1.0), ov=OV(LB("ORION", 130.6, 60, 1010, None, True, 20), LN("betelgeuse", t("Betelgeuse", 130.0) + 0.3, 1520, 360, 210),
                                                     LB("BETELGEUSE · ESO", t("Betelgeuse", 130.0) + 0.6, 1520, 600, None, False, 18, "center")))),
    ("2:14.12", G("betel", dist=21, el=40, az0=14, az1=26, rK=[[0, 0], [t("Mercury", 134.1) - 134.12, 0.42], [t("Venus", 134.1) - 134.12, 0.76], [t("Earth", 134.1) - 134.12, 1.05],
                                                                [t("Mars", 134.1) - 134.12, 1.6], [t("Jupiter", 134.1) - 134.12 + 0.6, 3.6]], ov=OV(
        HD("STEP 4 · BIGGER STARS"), BX("MERCURY", t("Mercury", 134.1), 60, 300), BX("VENUS", t("Venus", 134.1), 60, 350), BX("EARTH", t("Earth", 134.1), 60, 400, None, "v"),
        BX("MARS", t("Mars", 134.1), 60, 450), LB("JUPITER'S ORBIT", t("Jupiter", 134.1), 1500, 870, None, True, 18), ST_("WE'D BE LIVING INSIDE A STAR", 142.5, None, 960, False, 60)))),
    # ================= LIGHT =================
    ("2:24.72", N(ruler, 148.0, t("light", 150.5))),
    ("2:32.78", N(bignum, "THE SPEED OF LIGHT", 0, 300000, "KM EVERY SECOND", t("300", 155.5), 0, "", "", "THE FASTEST THING IN THE UNIVERSE", 153.4)),
    ("2:39.54", G("lightloop", t0=t("circle", 159.5) - 159.54, dur=t("eye", 159.5, end=True) - t("circle", 159.5) + 0.6, n=7, dist=6.4, el=16, az=-20, ov=OV(
        NM(0, 7, "TIMES AROUND EARTH", t("circle", 159.5), None, 900, t("eye", 159.5, end=True) - t("circle", 159.5) + 0.6), LB("IN ONE SECOND", t("blink", 159.5), 960, 1020, None, True, 22, "center")))),
    ("2:43.36", G("lightsys", distK=[[0, 4.5], [3.5, 5.5]], el=55, az=10, lightK=[[0.4, 0], [3.0, 1.0], [3.5, 1.0]], ov=OV(HD("LIGHT-MINUTES"), NM(0, 8, "MINUTES TO EARTH", t("eight", 163.3), 60, 880, 1.0)))),
    ("2:46.88", VD("px_sunrise_0", 0, ov=ST_("YOU SEE THE SUN AS IT WAS 8 MINUTES AGO", 167.4, None, 880, True, 56))),
    ("2:51.20", G("lightsys", distK=[[0, 16], [4.2, 95]], el=55, az0=10, az1=16, lightK=[[0, 1], [4.0, 30.1]], ov=OV(HD("LIGHT-HOURS"), NM(0, 4, "HOURS TO NEPTUNE", t("four", 171.2), 60, 880, 1.0)))),
    ("2:55.44", G("lightsys", voy=True, distK=[[0, 120], [8.6, 520]], el=40, az0=16, az1=24, lightK=[[0, 30], [8.0, 173]], ov=OV(
        NM(0, 61000, "KM PER HOUR", t("61", 175.4), 60, 120, 1.2, size=72), LB("VOYAGER 1", t("Voyager", 175.4), 1300, 330, None, False, 20)))),
    ("3:04.06", PH("alpha_cen", zoom=(1.0, 1.1), ov=OV(HD("STEP 5 · THE NEAREST STAR", 186.9), LN("proxima", t("Proxima", 186.9), 1460, 470, 250), LB("PROXIMA CENTAURI · HUBBLE", t("Proxima", 186.9) + 0.3, 1460, 750, None, True, 18, "center"), LB("THE ALPHA CENTAURI REGION · ESO", 185.0, 60, 1010, None, True, 18)))),
    ("3:10.70", N(neighbor, 191.0, t("pointed", 195.0))),
    ("3:15.08", N(cave_timeline, t("75", 195.0), t("cave", 201.0))),
    (t("cave", 201.0) + 0.6, PH("lascaux", zoom=(1.0, 1.1), ov=ST_("AND THAT'S OUR NEXT-DOOR NEIGHBOUR", 204.9, None, 900, True, 60))),
    # ================= GALAXY =================
    ("3:26.94", G("galaxy", art=IMGP("milkyway_art"), artOp=0.55, you=True, toSun0=1, toSun1=0.1, distK=[[0, 30], [5.5, 150]], el0=30, el1=55, az0=-40, az1=-10, ease="inout", ov=OV(
        HD("STEP 6 · THE MILKY WAY", 208.9), LB("ARTIST'S CONCEPT", 207.5, 1860, 1010, None, True, 16, "right"), FX("whoosh", 207.0, 0.5)))),
    ("3:32.52", G("galaxy", art=IMGP("milkyway_art"), artOp=0.55, dist0=150, dist1=135, el=58, az0=-10, az1=4, ov=OV(
        NM(0, 100000, "LIGHT-YEARS ACROSS", t("100", 212.5), None, 880, 1.2), LB("ARTIST'S CONCEPT", 212.6, 1860, 1010, None, True, 16, "right")))),
    ("3:39.64", VD("px_milkyway_0", 0, ov=NM(100, 400, "BILLION STARS", t("100", 219.6), None, 880, 1.2, prefix="100–"))),
    ("3:46.50", VD("px_coin_0", 0, ov=ST_("SHRINK THE SUN AND ALL 8 PLANETS TO A COIN", 227.0, None, 880, True, 56))),
    ("3:54.90", N(coin_india, 235.2, t("India", 235.0) - 1.2)),
    ("4:00.96", G("galaxy", art=IMGP("milkyway_art"), artOp=0.55, you=True, toSun0=0.2, toSun1=0.7, distK=[[0, 120], [7.7, 60]], el0=60, el1=45, az0=4, az1=20, ov=OV(
        LB("YOU ARE HERE · A QUIET SIDE ARM", t("ordinary", 241.0), 960, 960, None, False, 22, "center"), LB("ARTIST'S CONCEPT", 241.5, 1860, 1010, None, True, 16, "right")))),
    ("4:08.66", G("galaxy", art=IMGP("milkyway_art"), artOp=0.55, you=True, lap=True, lapK=[[0, 0], [12.68, 1]], spin=0, dist=140, el=62, az=10, ov=OV(
        NM(0, 800000, "KM PER HOUR", t("800", 250.0), 60, 120, 1.2, size=72), NM(0, 230, "MILLION YEARS PER LAP", t("230", 250.0), None, 880, 1.2)))),
    ("4:21.34", PH("dinosaur", mode="card", bg="navy", maxh=640, zoom=(1.0, 1.04), ov=OV(HD("LAST TIME WE WERE HERE"), LB("THE FIRST DINOSAURS · ~230 MILLION YEARS AGO", 262.0, 960, 960, None, True, 22, "center")))),
    ("4:28.74", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, dist0=180, dist1=230, el=40, az0=20, az1=30, ov=ST_("WE THOUGHT THIS WAS THE WHOLE UNIVERSE", 269.3, None, 900, True, 58))),
    ("4:34.00", PH("edwin_hubble", mode="card", bg="navy", maxh=760, zoom=(1.0, 1.04), ov=OV(HD("ABOUT 100 YEARS AGO"), LB("EDWIN HUBBLE", 274.6, 960, 1000, None, True, 22, "center")))),
    ("4:43.06", PH("andromeda", zoom=(1.0, 1.12), ov=OV(HD("STEP 7 · OTHER GALAXIES", 283.4), NM(0, 2.5, "MILLION LIGHT-YEARS AWAY", t("2", 284.9, prefix=True), None, 880, 1.0, dec=1),
                                                         LB("ANDROMEDA", 285.0, 60, 1010, None, True, 20)))),
    ("4:49.94", G("localgroup", mid0=0.85, mid1=0.6, distK=[[0, 900], [10.4, 2600]], el=20, az0=-30, az1=-10, lineK=[[0, 0], [1.0, 1]], ov=OV(
        LB("THIS LIGHT LEFT BEFORE MODERN HUMANS EXISTED", 290.6, 960, 960, 294.6, True, 22, "center"), ST_("A GHOST FROM THE DEEP PAST", t("ghost", 297.0), None, 900, False, 64)))),
    ("5:00.38", G("localgroup", mid=0.5, distK=[[0, 2600], [5.9, 4200]], el=30, az0=-10, az1=10, lineK=[[0, 1]], ov=OV(HD("THE LOCAL GROUP", 300.8), LB("ABOUT 80 GALAXIES, BOUND BY GRAVITY", 302.0, 960, 960, None, True, 22, "center")))),
    ("5:06.28", G("web", you=True, distK=[[0, 700], [9.3, 2300]], el=20, hlK=[[0, 0], [t("Laniakea", 306.2) - 306.28, 0], [t("Laniakea", 306.2) - 306.28 + 1, 1]], ov=OV(
        HD("STEP 8 · LANIAKEA", t("Laniakea", 306.2)), LB("“IMMEASURABLE HEAVEN” IN HAWAIIAN", t("immeasurable", 306.2), 960, 960, None, True, 22, "center"),
        LB("SIMULATED COSMIC WEB", 307.0, 1860, 1010, None, True, 16, "right")))),
    ("5:15.62", G("web", you=True, dist0=2300, dist1=2700, el=24, hlK=[[0, 1]], ov=OV(NM(0, 500, "MILLION LIGHT-YEARS ACROSS", t("500", 315.6), 60, 120, 1.2, size=72),
                                                                                    NM(0, 100000, "GALAXIES", t("100", 318.0), None, 880, 1.2), LB("SIMULATED COSMIC WEB", 316.0, 1860, 1010, None, True, 16, "right")))),
    ("5:21.72", G("web", dist0=2700, dist1=4200, el=24, ov=ST_("AND WE'RE STILL NOT DONE", 322.0, None, 900, True, 64))),
    # ================= DEEP FIELD =================
    ("5:24.10", PH("hubble_telescope", zoom=(1.0, 1.08), ov=OV(HD("2004"), LB("HUBBLE SPACE TELESCOPE", 324.6, 60, 1010, None, True, 20)))),
    ("5:28.72", G("deepfield", img=IMGP("hudf"), zK=[[0, 140], [10.4, 60]], imgK=[[0, 0]], frameK=[[0, 0], [1.0, 1]], ov=OV(
        LB("A PATCH THAT LOOKED EMPTY", 330.0, 960, 960, t("sand", 330.0), True, 22, "center"), LB("SMALLER THAN A GRAIN OF SAND AT ARM'S LENGTH", t("sand", 330.0), 960, 960, 338.9, False, 22, "center")))),
    ("5:39.22", G("deepfield", img=IMGP("hudf"), zK=[[0, 60], [4.0, 1.1], [9.1, 0.74]], imgK=[[0, 0], [1.6, 1]], frameK=[[0, 1], [3.4, 0]], ease="inout", ov=OV(
        HD("THE HUBBLE ULTRA DEEP FIELD", 340.6), NM(0, 10000, "GALAXIES", t("10", 339.2), None, 880, 1.4)))),
    ("5:48.38", VD("px_handsand_0", 0, ov=ST_("NOW COVER THE WHOLE SKY WITH THEM", 349.0, None, 880, True, 56))),
    ("5:53.96", VD("esahubble_hudf_flythrough", 30, ov=OV(ST_("EVERY DIRECTION LOOKS LIKE THAT", 354.4, None, 880, True, 58), LB("HUDF FLY-THROUGH · ESA/HUBBLE", 354.6, 1860, 1010, None, True, 16, "right")))),
    ("5:57.32", N(bignum, "GALAXIES WE CAN SEE", 0, 2, "TRILLION", t("trillion", 357.3) - 1.0, 0, "UP TO ", "", "EACH WITH BILLIONS OF STARS", t("trillion", 357.3) + 0.6)),
    ("6:05.38", VD("px_beach_0", 0, ov=ST_("MORE STARS THAN GRAINS OF SAND ON EVERY BEACH", 366.0, None, 880, True, 52))),
    # ================= OBSERVABLE =================
    ("6:11.94", G("observable", cmb=IMGP("cmb_sphere"), distK=[[0, 150], [2.1, 240]], el=14, cmbK=[[0, 0], [1.2, 1]], ov=ST_("SO HOW BIG IS ALL OF IT?", 372.3, None, 90, True, 64))),
    ("6:14.06", N(expansion, t("13", 374.0), t("stretching", 383.8) - 1.0, t("farther", 394.8))),
    ("6:39.82", G("observable", cmb=IMGP("cmb_sphere"), dist0=185, dist1=165, el=16, sx=330, ov=OV(HD("THE OBSERVABLE UNIVERSE"), NM(0, 93, "BILLION LIGHT-YEARS ACROSS", t("93", 399.8), 60, 880, 1.4, size=84),
                                                                                           LB("WALL: THE COSMIC MICROWAVE BACKGROUND · ESA PLANCK", 401.0, 1860, 1010, None, True, 16, "right"), FX("boom", t("93", 399.8), 0.6)))),
    ("6:47.22", N(voy_universe, t("Voyager", 410.6), t("cross", 415.0), t("hundreds", 424.9))),
    ("7:09.38", G("observable", cmb=IMGP("cmb_sphere"), dist0=240, dist1=280, el=16, ov=OV(ST_("AND THAT'S ONLY THE PART WE CAN SEE", 432.2, None, 900, False, 60), LB("THE WORD “OBSERVABLE” MATTERS", t("observable", 434.9), 960, 980, None, True, 22, "center")))),
    ("7:22.42", G("observable", cmb=IMGP("cmb_sphere"), dist0=280, dist1=460, el=18, beyondK=[[0, 0], [2.5, 1]], cmbK=[[0, 1], [6, 0.5]], ov=OV(
        ST_("BEYOND THE EDGE, IT KEEPS GOING", 442.8, t("Some", 449.6) - 0.4, 900, True, 60), ST_("MAYBE FOREVER", t("forever", 449.6), None, 900, False, 72)))),
    ("7:40.42", G("observable", cmb=IMGP("cmb_sphere"), dist0=460, dist1=600, el=18, beyondK=[[0, 1]], cmbK=[[0, 0.5]], ov=OV(
        ST_("WE DON'T KNOW", t("know", 465.0) - 0.3, None, 780, True, 110), LB("WHAT WE CAN SEE IS ALREADY TOO BIG TO IMAGINE", 466.6, 960, 930, None, False, 22, "center")))),
    # ================= ENDING =================
    ("7:50.78", G("voyager", dist0=10, dist1=12, az0=200, az1=160, cy=0.5, yaw=-0.6, ov=OV(BX("FEBRUARY 14, 1990", 471.4, 60, 940), LB("ONE LAST PICTURE OF HOME", t("picture", 471.0), 60, 1000, None, True)))),
    ("7:58.54", PH("pale_blue_dot", zoom=(1.0, 1.35), origin="64% 66%", ov=OV(HD("THE PALE BLUE DOT"), LB("FROM 6 BILLION KM", 479.2, 60, 1010, None, True, 20)))),
    ("8:07.34", VD("px_crowd_2", 3, ov=ST_("EVERYONE WHO EVER LIVED, ON ONE DOT", 488.0, None, 880, True, 56))),
    ("8:14.78", G("lightsys", voy=True, distK=[[0, 300], [3.7, 1200]], el=40, az=20, ov=LB("TAKEN FROM INSIDE OUR SOLAR SYSTEM", 495.3, 960, 960, None, True, 22, "center"))),
    ("8:18.52", G("galaxy", art=IMGP("milkyway_art"), artOp=0.5, you=True, dist0=90, dist1=170, el=50, az=10, ov=LB("FROM THE EDGE OF THE GALAXY, THE DOT IS GONE", 499.0, 960, 960, None, True, 22, "center"))),
    ("8:21.72", G("observable", cmb=IMGP("cmb_sphere"), dist0=240, dist1=290, el=16, ov=LB("FROM THE EDGE OF THE OBSERVABLE UNIVERSE, EVEN OUR GALAXY VANISHES", 502.3, 960, 960, None, True, 20, "center"))),
    ("8:26.74", VD("nasa_voyager_beauty3", 1.0, ov=OV(LB("THE GOLDEN RECORD · ANIMATION NASA SVS", 507.3, 1860, 1010, None, True, 16, "right"), ST_("WE'RE THE PART OF THE UNIVERSE THAT LOOKED UP", t("looked", 509.5) - 0.8, None, 880, True, 56)))),
    ("8:36.42", G("earth", dist0=3.2, dist1=3.6, el=8, az0=10, az1=22, sun=[-70, 6], ov=ST_("MAYBE THAT MAKES US A LITTLE LESS SMALL", 516.8, None, 900, False, 60))),
    ("8:38.94", N(endcard, I("cmb_planck", 800, 800), "8:47.24")),
]

# persistent scale readout (top right): (start, end, text)
HUD = [("0:54.76", "1:16.86", "SCALE · 12,700 KM"), ("1:16.86", "1:41.32", "SCALE · 384,400 KM"), ("1:41.32", "2:10.04", "SCALE · 1.4 MILLION KM"),
       ("2:14.12", "2:24.72", "SCALE · ~1 BILLION KM"), ("2:43.36", "2:51.20", "SCALE · LIGHT-MINUTES"), ("2:51.20", "2:55.44", "SCALE · LIGHT-HOURS"),
       ("2:55.44", "3:04.06", "SCALE · 1 LIGHT-DAY"), ("3:04.06", "3:26.94", "SCALE · 4.2 LIGHT-YEARS"), ("3:26.94", "4:43.06", "SCALE · 100,000 LIGHT-YEARS"),
       ("4:43.06", "5:06.28", "SCALE · 2.5 MILLION LIGHT-YEARS"), ("5:06.28", "5:24.10", "SCALE · 500 MILLION LIGHT-YEARS"), ("6:39.82", "7:50.78", "SCALE · 93 BILLION LIGHT-YEARS")]


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
            fn(a, b); continue
        if last_in_part: bx, fout = min(b, p1), 0.0
        elif nxt is not None and nxt.k == "3d": bx, fout = b + 0.3, 0.55
        else: bx, fout = b + 0.5, 0.0
        fin = 0.0 if abs(a - p0) < 0.05 and k else 0.45
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
            if prv is not None and prv.k == "3d" and fn.k == "2d": sfx("whoosh", a - 0.15, 0.4)
    # scale readout on top of everything
    for st, en, txt in HUD:
        a, b = max(s(st), p0), min(s(en), p1)
        ST["skip"] = not (a < b - 0.3)
        if not ST["skip"]: layer(a, b, lab(txt, a + 0.2, 1856, 60, b, True, 16, "right"), fin=0, z=9000)
    # part seams: dip to black over the last / first 0.35 s
    ST["skip"] = False
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


PARTS = [0.0, s("3:04.06"), s("5:24.10"), END]

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
