"""EP2 navy 2D scenes (calm palette: ink type, sand accent, slate secondary). Each returns full layer HTML for [a, b)."""
from lib import *
from scenes2d import prog

BLUE = "#6f9be0"


def dotlab(x, y, r, t, col, text, below=True, tcol=None):
    return (svg(disk(x, y, r, t, col)) + lab(text, t + 0.15, x, y + (r + 18 if below else -r - 40), None, tcol is None, 20, "center"))


def lightday(a, b, t_go, t_day):
    """Earth at left, Voyager at right; a light pulse crosses while a clock counts 0 -> 24 hours."""
    pid = nid("pl"); d = max(1.0, s(t_day) - s(t_go))
    prog(t_go, d, f'document.getElementById("{pid}").setAttribute("cx",(260+1400*p).toFixed(1));', "none")
    out = navy(a, b) + hdr("ONE LIGHT-DAY", a + 0.1)
    out += svg(disk(260, 560, 26, a + 0.2, BLUE) + disk(1660, 560, 9, a + 0.4, NEON) + line(300, 560, 1640, 560, a + 0.5, 0.8, RING, 2, dash="6 10") +
               fadein(t_go, f'<circle id="{pid}" cx="260" cy="560" r="7" fill="{INK}"/>'))
    out += lab("EARTH", a + 0.3, 260, 610, None, True, 20, "center") + lab("VOYAGER 1", a + 0.5, 1660, 610, None, False, 20, "center")
    out += lab("A RADIO SIGNAL AT THE SPEED OF LIGHT", t_go, 960, 470, None, True, 20, "center")
    out += num(0, 24, "HOURS", t_go, None, 760, d, size=120)
    return out


def ladder(a, b, items, title="THE ZOOM-OUT"):
    """Steps of the journey along a line; items [(label, t)]."""
    n = len(items); x0, x1 = 200, 1720
    out = navy(a, b) + hdr(title, a + 0.1)
    sv = line(x0, 560, x1, 560, a + 0.2, 1.2, RING, 2)
    for i, (lb, t) in enumerate(items):
        x = x0 + (x1 - x0) * i / (n - 1)
        sv += disk(x, 560, 9 + i * 1.5, t, NEON if i in (0, n - 1) else INK)
        out += lab(lb, t + 0.1, x, 600 if i % 2 == 0 else 490, None, i not in (0, n - 1), 19, "center")
    return out + svg(sv)


def massbar(a, b, t_sun, t_rest):
    W_ = 1400
    return navy(a, b) + hdr("WHERE THE MASS IS", a + 0.1) + svg(
        bar(260, 500, W_ * 0.9986, 90, t_sun, ORANGE, 1.4) + bar(260 + W_ * 0.9986 + 4, 500, 6, 90, t_rest, INK, 0.3)) + \
        num(0, 99.86, "% · THE SUN", t_sun, 260, 380, 1.4, dec=2, size=96) + \
        lab("EVERY PLANET, MOON AND ASTEROID: 0.14%", t_rest, 1666, 630, None, True, 20, "right")


def ruler(a, b, t_big, t_light):
    zid = nid("rz")
    out = navy(a, b) + hdr("WE NEED A BETTER RULER", a + 0.1)
    sv = line(200, 600, 1720, 600, a + 0.2, 1.0, RING, 2) + "".join(line(200 + i * 152, 585, 200 + i * 152, 615, a + 0.3 + i * 0.04, 0.2, RING, 2) for i in range(11))
    out += svg(sv) + num(1000, 40000000000000, "KM", a + 0.6, None, 440, max(1.0, s(t_light) - a - 1.2), size=110)
    tw(f"#{zid}", {"opacity": 1}, t_light, 0.4, {"opacity": 0})
    out += f'<div id="{zid}" style="position:absolute;left:600px;top:470px;width:720px;height:6px;background:{PINK};opacity:0;transform:rotate(-4deg)"></div>'
    out += stmt("USE LIGHT INSTEAD", t_light + 0.3, None, 700, False, 72)
    return out


def neighbor(a, b, t_dist, t_voy):
    out = navy(a, b) + hdr("OUR NEAREST STAR", a + 0.1)
    out += svg(disk(220, 560, 18, a + 0.2, ORANGE) + disk(1700, 560, 14, a + 0.4, "#e58a6a") + line(250, 560, 1680, 560, t_dist, 1.4, INK, 2) +
               line(250, 545, 251, 575, t_voy, 0.2, NEON, 3))
    out += lab("THE SUN", a + 0.3, 220, 600, None, True, 20, "center") + lab("PROXIMA CENTAURI", a + 0.5, 1700, 600, None, True, 20, "center")
    out += num(0, 4.2, "LIGHT-YEARS", t_dist, None, 400, 1.2, dec=1, size=110)
    out += lab("VOYAGER'S 1 LIGHT-DAY = 1/1,534 OF THE WAY", t_voy, 252, 660, None, False, 20, "left")
    return out


def cave_timeline(a, b, t_years, t_cave):
    """0 .. 75,000 years; oldest known cave art ~51,000 years ago."""
    x0, x1 = 200, 1720
    X = lambda y: x0 + (x1 - x0) * y / 75000
    out = navy(a, b) + hdr("VOYAGER TO PROXIMA", a + 0.1)
    sv = line(x0, 640, x1, 640, a + 0.2, 1.4, RING, 3) + bar(x0, 628, x1 - x0, 24, t_years, NEON, 2.0)
    sv += disk(X(51000), 640, 12, t_cave, PINK) + line(X(51000), 628, X(51000), 560, t_cave, 0.4, PINK, 2)
    out += svg(sv) + num(0, 75000, "YEARS", t_years, None, 380, 1.6, size=120)
    out += lab("OLDEST KNOWN CAVE ART · ~51,000 YEARS AGO", t_cave + 0.1, X(51000), 520, None, True, 20, "center")
    return out


def coin_india(a, b, t_coin, t_india):
    out = navy(a, b) + hdr("SHRINK THE SOLAR SYSTEM", a + 0.1)
    out += svg(disk(300, 560, 34, t_coin, "#b9a46a", stroke="#e4cd92") +
               bar(380, 552, 1340, 16, t_india, INK, 1.8))
    out += lab("SOLAR SYSTEM = A COIN", t_coin + 0.2, 300, 620, None, False, 20, "center")
    out += lab("THE MILKY WAY ≈ THE WIDTH OF INDIA", t_india + 0.6, 1050, 610, None, True, 22, "center")
    return out


def expansion(a, b, t_age, t_stretch, t_far):
    """Light from a far galaxy heads to us while the space between stretches."""
    gid, pid = nid("gx"), nid("ph"); d = s(b) - s(t_stretch)
    prog(t_stretch, d, f'document.getElementById("{gid}").setAttribute("cx",(900+800*p).toFixed(1));'
                       f'document.getElementById("{pid}").setAttribute("cx",(900-660*p).toFixed(1));', "power1.inOut")
    grid = "".join(f'<line id="g{nid()}" x1="{240 + i * 120}" y1="520" x2="{240 + i * 120}" y2="600" stroke="{RING}" stroke-width="1" opacity=".6"/>' for i in range(13))
    out = navy(a, b) + hdr("SPACE ITSELF IS STRETCHING", a + 0.1)
    out += svg(fadein(a + 0.2, grid) + disk(240, 560, 16, a + 0.3, BLUE) +
               fadein(a + 0.5, f'<circle id="{gid}" cx="900" cy="560" r="14" fill="{NEON}"/>') + fadein(t_stretch, f'<circle id="{pid}" cx="900" cy="560" r="6" fill="{INK}"/>'))
    out += lab("US", a + 0.3, 240, 600, None, True, 20, "center") + lab("A DISTANT GALAXY", a + 0.6, 900, 470, t_stretch, False, 20, "center")
    out += num(0, 13.8, "BILLION YEARS OLD", t_age, None, 330, 1.0, dec=1, size=96)
    out += lab("ITS LIGHT TRAVELS... AND THE GALAXY KEEPS MOVING AWAY", t_stretch + 0.3, 960, 700, None, True, 20, "center")
    out += lab("NOW ~46 BILLION LIGHT-YEARS AWAY", t_far, 1700, 470, None, False, 20, "right")
    return out


def voy_universe(a, b, t1, t2, t3):
    out = navy(a, b) + hdr("ONE LAST COMPARISON", a + 0.1)
    out += svg(bar(260, 380, 6, 40, t1, NEON, 0.3) + bar(260, 560, 1400, 40, t2, INK, 1.6))
    out += lab("VOYAGER 1 · 1 LIGHT-DAY IN ~50 YEARS", t1, 260, 340, None, False, 22)
    out += lab("THE OBSERVABLE UNIVERSE · 93 BILLION LIGHT-YEARS", t2, 260, 520, None, True, 22)
    out += num(1, 1.6, "QUADRILLION YEARS AT VOYAGER'S SPEED", t2 + 1.0, 260, 640, 1.0, dec=1, prefix="~", size=80)
    out += stmt("≈ 120,000 × THE AGE OF THE UNIVERSE", t3, None, 820, False, 64)
    return out


def endcard(a, b, img, t_name):
    return navy(a, b) + hdr("UP NEXT", a + 0.1) + lens(a + 0.3, 560, 500, 260, img) + \
        lab("THE EDGE OF THE OBSERVABLE UNIVERSE", a + 0.6, 560, 790, None, True, 22, "center") + \
        f'<div style="position:absolute;left:1110px;top:300px;width:620px;height:400px;border:3px dashed {RING}"></div>' + \
        stmt("OUTSIDE LAY", t_name, None, 870, False, 120)
