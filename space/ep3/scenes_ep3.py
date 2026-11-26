"""EP3 navy 2D scenes (calm palette). Each returns full layer HTML for [a, b). Elements are placed in fixed regions so nothing overlaps."""
import math
from lib import *
from scenes2d import prog

BLUE = "#6f9be0"
DIM = "#2a3446"


def rankcard(a, b, n, name, tag, t_name=None):
    """Big rank numeral, the name under it, a one-line tag in mono."""
    t_name = t_name or a + 0.5
    nid_ = nid("rk")
    tw(f"#{nid_}", {"opacity": 1, "y": 0}, a + 0.15, 0.7, {"opacity": 0, "y": 24}, "power2.out")
    return (navy(a, b) + f'<div id="{nid_}" style="position:absolute;left:0;right:0;top:250px;text-align:center;font-family:Anton;font-size:300px;line-height:1;color:{NEON};opacity:0">{n}</div>'
            + stmt(name, t_name, None, 610, True, 96) + lab(tag, t_name + 0.5, 960, 760, None, False, 22, "center"))


def ranklist(a, b, t_on, t_low, t_top):
    """Eight numbered slots, all unknown. The bottom ('deadly') and top ('where you are') highlight on cue."""
    out = navy(a, b) + hdr("THE RANKING", a + 0.1)
    sv = ""
    for i, n in enumerate(range(8, 0, -1)):
        x = 250 + i * 203; t = t_on + i * 0.18
        sv += f'<rect x="{x - 80}" y="420" width="160" height="220" rx="6" fill="none" stroke="{RING}" stroke-width="2"/>'
        out += lab(f"#{n}", t, x, 455, None, n not in (8, 1), 30, "center") + lab("?", t + 0.1, x, 540, None, True, 44, "center")
    out += svg(fadein(t_on, sv))
    out += lab("SIMPLY DEADLY", t_low, 250, 680, None, False, 18, "center") + lab("WHERE ARE YOU?", t_top, 1671, 680, None, False, 18, "center")
    return out


def lightcurve(a, b, t_rise, t_end):
    """Brightness of the 2011 star over ~270 days: a smooth, symmetric swell and fade."""
    x0, x1, y0, y1 = 300, 1620, 760, 340
    pid = nid("lc"); d = max(1.5, s(t_end) - s(t_rise))
    pts = []
    for i in range(201):
        u = i / 200; mag = math.exp(-((u - 0.5) / 0.16) ** 2)
        pts.append(f"{x0 + (x1 - x0) * u:.1f},{y0 - (y0 - y1) * 0.85 * mag:.1f}")
    L = 2600
    tw(f"#{pid}", {"strokeDashoffset": 0}, t_rise, d, {"strokeDashoffset": L}, "none")
    axes = (f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="{RING}" stroke-width="2"/><line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1 - 20}" stroke="{RING}" stroke-width="2"/>')
    out = navy(a, b) + hdr("A STAR THAT SWELLED WITH LIGHT", a + 0.1)
    out += svg(fadein(a + 0.2, axes) + f'<polyline id="{pid}" points="{" ".join(pts)}" fill="none" stroke="{NEON}" stroke-width="4" stroke-dasharray="{L}" stroke-dashoffset="{L}"/>')
    out += lab("BRIGHTNESS", a + 0.3, x0 - 20, y1 - 60, None, True, 18, "left") + lab("~270 DAYS", t_rise, (x0 + x1) // 2, y0 + 24, None, False, 20, "center")
    return out


def orbit_nothing(a, b, t_star, t_mass):
    """A Sun-like star circling an empty point."""
    cx, cy, r = 960, 560, 260
    sid = nid("os")
    prog(t_star, s(b) - s(t_star), f'var A=p*{(s(b) - s(t_star)) * 0.9:.2f};document.getElementById("{sid}").setAttribute("transform","translate("+({cx}+{r}*Math.cos(A)).toFixed(1)+","+({cy}+{r}*0.42*Math.sin(A)).toFixed(1)+")");')
    out = navy(a, b) + hdr("CIRCLING NOTHING", a + 0.1)
    out += svg(ring(cx, cy, r, a + 0.2, 1.2, RING, 2, ry=r * 0.42) + fadein(a + 0.5, f'<circle cx="{cx}" cy="{cy}" r="7" fill="none" stroke="{NEON}" stroke-width="2" stroke-dasharray="3 4"/>')
               + fadein(t_star, f'<g id="{sid}"><circle r="22" fill="#f2c27a"/></g>'))
    out += lab("A STAR LIKE OUR SUN", t_star + 0.3, 960, 340, None, True, 20, "center") + lab("EMPTY?", a + 0.7, cx, cy + 26, None, False, 18, "center")
    out += num(0, 10, "× THE MASS OF THE SUN", t_mass, None, 820, 1.0, size=84)
    return out


def distance_line(a, b, t_dist, label, n0, n1, unit, dec=0):
    out = navy(a, b) + hdr(label, a + 0.1)
    out += svg(disk(260, 560, 16, a + 0.2, BLUE) + disk(1660, 560, 12, a + 0.4, "#111") + f'<circle cx="1660" cy="560" r="16" fill="none" stroke="{NEON}" stroke-width="2"/>'
               + line(290, 560, 1630, 560, t_dist, 1.2, RING, 2, dash="6 10"))
    out += lab("EARTH", a + 0.3, 260, 600, None, True, 18, "center") + lab("BLACK HOLE", a + 0.5, 1660, 600, None, False, 18, "center")
    out += num(n0, n1, unit, t_dist, None, 400, 1.2, dec=dec, size=100)
    return out


def tidal(a, b, astro_img, t_earth, t_bh, t_stretch):
    """Feet pulled harder than the head. On Earth: two near-equal arrows. Near a small black hole: arrows diverge and the body stretches."""
    sid = nid("as"); d = max(1.0, s(b) - s(t_stretch))
    tw(f"#{sid}", {"scaleY": 1.7, "scaleX": 0.62}, t_stretch, d, {"scaleY": 1.0, "scaleX": 1.0}, "power1.in")
    out = navy(a, b) + hdr("THE STRETCH", a + 0.1)
    out += f'<div style="position:absolute;left:800px;top:330px;width:320px;height:340px"><img id="{sid}" src="{astro_img}" style="width:320px;height:340px;object-fit:contain;transform-origin:50% 60%"></div>'
    out += svg(fadein(a + 0.2, f'<circle cx="960" cy="1250" r="560" fill="none" stroke="{RING}" stroke-width="2"/>')
               + fadein(t_earth, f'<line x1="1120" y1="360" x2="1120" y2="410" stroke="{INK}" stroke-width="4"/><line x1="1120" y1="600" x2="1120" y2="652" stroke="{INK}" stroke-width="4"/>', end=t_bh)
               + fadein(t_bh, f'<line x1="1120" y1="360" x2="1120" y2="390" stroke="{NEON}" stroke-width="5"/><line x1="1120" y1="600" x2="1120" y2="760" stroke="{NEON}" stroke-width="5"/>'))
    out += lab("HEAD: PULLED LESS", t_earth, 1150, 370, None, True, 18) + lab("FEET: PULLED MORE", t_earth, 1150, 610, None, True, 18)
    out += lab("ON EARTH: TOO TINY TO FEEL", t_earth + 0.3, 960, 900, t_bh, False, 20, "center") + lab("NEAR A SMALL BLACK HOLE", t_bh, 960, 900, None, False, 20, "center")
    return out


def gentle(a, b, t_small, t_big):
    out = navy(a, b) + hdr("SMALL VS SUPERMASSIVE", a + 0.1)
    out += svg(disk(480, 560, 14, t_small, "#000", stroke=NEON) + ring(480, 560, 120, t_small, 0.8, PINK, 3)
               + disk(1420, 560, 250, t_big, "#000", stroke=NEON) + ring(1420, 560, 262, t_big, 0.8, "#7fb08a", 3))
    out += lab("SMALL: TORN APART LONG BEFORE THE EDGE", t_small + 0.4, 480, 760, None, True, 18, "center")
    out += lab("SUPERMASSIVE: CROSS WITHOUT FEELING A THING", t_big + 0.4, 1420, 860, None, True, 18, "center")
    return out


def kick(a, b, t_boom, t_fly):
    """A lopsided supernova kicks the newborn black hole across the galaxy."""
    bid, kid = nid("bm"), nid("kk")
    tw(f"#{bid}", {"scale": 1.0, "opacity": 0.0}, t_boom, 1.6, {"scale": 0.2, "opacity": 1.0}, "power2.out")
    tw(f"#{kid}", {"x": 900, "y": -120}, t_fly, max(1.0, s(b) - s(t_fly)), {"x": 0, "y": 0}, "power1.in")
    burst = "".join(f'<line x1="760" y1="560" x2="{760 + (280 if i < 9 else 120) * math.cos(i * 0.52):.0f}" y2="{560 + (280 if i < 9 else 120) * math.sin(i * 0.52):.0f}" stroke="#f2c27a" stroke-width="4"/>' for i in range(12))
    out = navy(a, b) + hdr("A LOPSIDED EXPLOSION", a + 0.1)
    out += svg(fadein(a + 0.2, f'<circle cx="760" cy="560" r="70" fill="#d9a25f"/>', end=t_boom) + f'<g id="{bid}" style="transform-origin:760px 560px;transform-box:view-box" opacity="0">{burst}</g>'
               + fadein(t_boom + 0.3, f'<g id="{kid}"><line x1="700" y1="575" x2="760" y2="560" stroke="{NEON}" stroke-width="3" opacity=".6"/><circle cx="760" cy="560" r="16" fill="#000" stroke="{NEON}" stroke-width="3"/></g>'))
    out += lab("A DYING GIANT STAR", a + 0.4, 760, 680, t_boom, True, 20, "center") + lab("THE NEWBORN BLACK HOLE IS KICKED LIKE A CANNONBALL", t_fly, 960, 880, None, False, 20, "center")
    return out


def microlens(a, b, t_bend, t_bright):
    """Star -> black hole -> Earth on one line: light bends around the hole and the star looks brighter."""
    out = navy(a, b) + hdr("MICROLENSING", a + 0.1)
    rays = "".join(f'<path d="M1700,560 Q960,{560 + k * 140} 260,560" fill="none" stroke="#f2c27a" stroke-width="2" opacity=".75"/>' for k in (-1, 1))
    out += svg(disk(1700, 560, 18, a + 0.2, "#f2c27a") + disk(960, 560, 16, a + 0.4, "#000", stroke=NEON) + disk(260, 560, 16, a + 0.6, BLUE) + fadein(t_bend, rays))
    out += lab("DISTANT STAR", a + 0.3, 1700, 600, None, True, 18, "center") + lab("BLACK HOLE", a + 0.5, 960, 600, None, False, 18, "center") + lab("EARTH", a + 0.7, 260, 600, None, True, 18, "center")
    out += lab("ITS GRAVITY BENDS THE LIGHT LIKE A GLASS LENS", t_bend + 0.3, 960, 360, None, True, 20, "center")
    out += lab("THE ONLY WAY TO SEE A LONE BLACK HOLE", t_bright, 960, 800, None, False, 20, "center")
    return out


def orbit_drift(a, b, t_warp):
    """Planet orbits start to stretch, tugged by something unseen."""
    out = navy(a, b) + hdr("THE FIRST SIGN", a + 0.1)
    ids = [nid("od") for _ in range(4)]
    for i, oid in enumerate(ids):
        tw(f"#{oid}", {"scaleX": 1.0 + 0.12 * (i + 1), "x": 30 * (i + 1)}, t_warp, max(1.0, s(b) - s(t_warp)), {"scaleX": 1.0, "x": 0}, "power1.inOut")
    sv = f'<circle cx="760" cy="560" r="14" fill="#f2c27a"/>' + "".join(f'<ellipse id="{oid}" cx="760" cy="560" rx="{90 + i * 85}" ry="{(90 + i * 85) * 0.42:.0f}" fill="none" stroke="{RING}" stroke-width="2" style="transform-origin:760px 560px;transform-box:view-box"/>' for i, oid in enumerate(ids))
    out += svg(fadein(a + 0.2, sv) + fadein(t_warp, f'<circle cx="1640" cy="520" r="12" fill="#000" stroke="{NEON}" stroke-width="2" stroke-dasharray="3 4"/>'))
    out += lab("SOMETHING NO ONE CAN SEE", t_warp + 0.4, 1640, 560, None, False, 18, "center") + lab("ORBITS STRETCH AND DRIFT, YEARS AHEAD", t_warp + 0.8, 960, 880, None, True, 20, "center")
    return out


def sizes(a, b, t1, t2):
    out = navy(a, b) + hdr("PRIMORDIAL BLACK HOLES", a + 0.1)
    out += stmt("THE MASS OF A MOUNTAIN", t1, None, 360, True, 70) + lab("SMALLER THAN AN ATOM", t1 + 0.6, 960, 460, None, False, 26, "center")
    out += stmt("THE MASS OF A PLANET", t2, None, 620, True, 70) + lab("FITS IN THE PALM OF YOUR HAND", t2 + 0.6, 960, 720, None, False, 26, "center")
    return out


def planet9(a, b, t_orbits, t_q, t_bh):
    out = navy(a, b) + hdr("PLANET NINE?", a + 0.1)
    cx, cy = 820, 560
    orbs = "".join(f'<ellipse cx="{cx + 150 + i * 14}" cy="{cy - 10}" rx="{260 + i * 30}" ry="{120 + i * 8}" transform="rotate({-12 + i * 6} {cx} {cy})" fill="none" stroke="#9db3d8" stroke-width="2" opacity=".75"/>' for i in range(6))
    out += svg(fadein(a + 0.2, f'<circle cx="{cx}" cy="{cy}" r="9" fill="#f2c27a"/><circle cx="{cx}" cy="{cy}" r="70" fill="none" stroke="{RING}" stroke-width="2"/>')
               + fadein(t_orbits, orbs) + fadein(t_q, f'<ellipse cx="{cx - 260}" cy="{cy + 20}" rx="620" ry="300" transform="rotate(170 {cx} {cy})" fill="none" stroke="{NEON}" stroke-width="2" stroke-dasharray="8 10"/>')
               )
    out += lab("NEPTUNE'S ORBIT", a + 0.4, cx, cy + 90, None, True, 16, "center") + lab("ICY WORLDS, ORBITS CLUSTERED", t_orbits + 0.3, 1440, 380, None, True, 18, "center")
    out += lab("AN UNSEEN PULL", t_q + 0.3, 300, 860, None, False, 18, "left")
    out += lab("WHAT IF IT'S A BLACK HOLE?", t_bh, 960, 980, None, False, 22, "center")
    return out


def neutrino(a, b, t_go, t_ice):
    pid = nid("nu"); d = max(1.0, s(t_ice) - s(t_go))
    prog(t_go, d, f'document.getElementById("{pid}").setAttribute("cx",(1660-1400*p).toFixed(1));', "none")
    out = navy(a, b) + hdr("A STRAIGHT LINE ACROSS THE UNIVERSE", a + 0.1)
    out += svg(disk(1660, 560, 16, a + 0.2, "#b9c8ff") + disk(260, 560, 16, a + 0.4, BLUE) + line(1640, 560, 280, 560, a + 0.6, 1.4, RING, 2, dash="6 10")
               + fadein(t_go, f'<circle id="{pid}" cx="1660" cy="560" r="6" fill="{INK}"/>'))
    out += lab("BLAZAR TXS 0506+056", a + 0.3, 1660, 600, None, True, 18, "center") + lab("EARTH · ANTARCTIC ICE", a + 0.5, 260, 600, None, True, 18, "center")
    out += num(0, 4, "BILLION LIGHT-YEARS", t_go, None, 380, 1.0, size=96)
    return out


def threebody(a, b, t_three, t_throw):
    """Three supermassive black holes; two flung one way, the third the other."""
    ids = [nid("tb") for _ in range(3)]
    tw(f"#{ids[0]}", {"x": -700, "y": -60}, t_throw, 2.4, {"x": 0, "y": 0}, "power2.in")
    tw(f"#{ids[1]}", {"x": -640, "y": 80}, t_throw, 2.4, {"x": 0, "y": 0}, "power2.in")
    tw(f"#{ids[2]}", {"x": 820, "y": 0}, t_throw + 0.6, max(1.5, s(b) - s(t_throw) - 0.6), {"x": 0, "y": 0}, "power2.in")
    out = navy(a, b) + hdr("A GRAVITATIONAL TUG OF WAR", a + 0.1)
    pos = [(900, 520), (1010, 610), (1000, 480)]
    sv = "".join(fadein(t_three + i * 0.2, f'<g id="{gid}"><circle cx="{x}" cy="{y}" r="22" fill="#000" stroke="{NEON}" stroke-width="3"/></g>') for i, (gid, (x, y)) in enumerate(zip(ids, pos)))
    out += svg(sv) + lab("THREE SUPERMASSIVE BLACK HOLES", t_three + 0.4, 960, 340, None, True, 20, "center")
    out += lab("TWO THROWN ONE WAY", t_throw + 0.4, 300, 760, None, True, 18) + lab("THE THIRD HURLED OUT OF ITS GALAXY", t_throw + 1.2, 1620, 760, None, False, 18, "right")
    return out


def quasar_scale(a, b, t_disk, t_prox):
    cx, cy, k = 960, 560, 95   # px per light-year
    out = navy(a, b) + hdr("SEVEN LIGHT-YEARS ACROSS", a + 0.1)
    out += svg(fadein(t_disk, f'<circle cx="{cx}" cy="{cy}" r="{3.5 * k:.0f}" fill="#d9a25f" opacity=".22"/><circle cx="{cx}" cy="{cy}" r="{3.5 * k:.0f}" fill="none" stroke="#d9a25f" stroke-width="3"/>')
               + disk(cx, cy, 8, a + 0.2, "#f2c27a") + disk(cx + 4.2 * k, cy, 9, t_prox, "#e58a6a") + line(cx, cy, cx + 4.2 * k, cy, t_prox, 0.8, RING, 2, dash="5 8"))
    out += lab("THE SUN", a + 0.3, cx, cy + 26, None, True, 16, "center") + lab("PROXIMA CENTAURI · 4.2 LY", t_prox + 0.2, cx + 4.2 * k, cy + 30, None, True, 16, "center")
    out += lab("J0529'S DISK, CENTRED ON THE SUN", t_disk + 0.3, cx, cy - 3.5 * k - 40, None, False, 18, "center")
    return out


def oneway(a, b, t_cross, t_out):
    """Inside the horizon every path points inward."""
    out = navy(a, b) + hdr("THE EVENT HORIZON", a + 0.1)
    cx, cy, R = 960, 580, 300
    outer = "".join(f'<line x1="{cx + (R + 60) * math.cos(t):.0f}" y1="{cy + (R + 60) * math.sin(t):.0f}" x2="{cx + (R + 140) * math.cos(t):.0f}" y2="{cy + (R + 140) * math.sin(t):.0f}" stroke="{INK}" stroke-width="3" opacity=".7"/>' for t in [i * 0.785 for i in range(8)])
    inner = "".join(f'<line x1="{cx + (R - 40) * math.cos(t):.0f}" y1="{cy + (R - 40) * math.sin(t):.0f}" x2="{cx + (R - 140) * math.cos(t):.0f}" y2="{cy + (R - 140) * math.sin(t):.0f}" stroke="{PINK}" stroke-width="3"/>' for t in [i * 0.785 + 0.39 for i in range(8)])
    out += svg(disk(cx, cy, R, a + 0.2, "#000", stroke=NEON) + fadein(a + 0.6, outer) + fadein(t_cross, inner))
    out += lab("OUTSIDE: YOU CAN STILL ESCAPE", a + 0.8, cx + R + 170, cy - 20, None, True, 18, "left") + lab("INSIDE: EVERY PATH POINTS INWARD", t_cross + 0.3, cx, cy - 10, None, False, 18, "center")
    out += lab("NO ONE OUTSIDE CAN EVER SEE IN", t_out, cx, 1000, None, True, 20, "center")
    return out


def coincidence(a, b, t_mass, t_eq):
    out = navy(a, b) + hdr("A DEEPLY UNCOMFORTABLE CALCULATION", a + 0.1)
    out += lab("ALL THE MASS IN THE OBSERVABLE UNIVERSE", t_mass, 960, 330, None, True, 22, "center")
    out += stmt("ITS BLACK HOLE SIZE", t_mass + 1.2, None, 430, False, 72)
    out += stmt("≈ THE SIZE OF THE OBSERVABLE UNIVERSE", t_eq, None, 600, True, 64)
    out += lab("ROUGH, AND MAYBE PURE COINCIDENCE", t_eq + 1.5, 960, 760, None, False, 20, "center")
    return out


def spins(a, b, t_on, t_count):
    """A grid of galaxies; about two-thirds spin the same way (sand), the rest the other way (slate)."""
    out = navy(a, b) + hdr("WHICH WAY DO THEY SPIN?", a + 0.1)
    sv = ""
    import random
    cols, rows = 10, 4; order = list(range(cols * rows)); random.Random(7).shuffle(order); others = set(order[:13])   # exactly 27 of 40 spin the same way
    for i in range(cols * rows):
        x, y = 230 + (i % cols) * 162, 360 + (i // cols) * 140
        same = i not in others
        c = NEON if same else "#7d93b8"
        sg = 1 if same else -1   # two curved spiral arms; mirrored for the other spin direction
        arc = (f'<g transform="translate({x},{y}) scale({sg},1)"><path d="M0,0 C14,-4 22,-18 10,-28 M0,0 C-14,4 -22,18 -10,28" fill="none" stroke="{c}" stroke-width="3" stroke-linecap="round"/>'
               f'<circle r="5" fill="{c}"/></g>')
        sv += fadein(t_on + i * 0.03, arc)
    out += svg(sv) + num(0, 67, "% SPIN THE SAME WAY · ABOUT TWO-THIRDS", t_count, None, 920, 1.2, suffix="", size=84)
    return out


def endcard(a, b, img, t_name):
    return navy(a, b) + hdr("UP NEXT", a + 0.1) + lens(a + 0.3, 560, 500, 260, img) + \
        lab("THE GIANT AT THE CENTRE OF OUR GALAXY", a + 0.6, 560, 790, None, True, 22, "center") + \
        f'<div style="position:absolute;left:1110px;top:300px;width:620px;height:400px;border:3px dashed {RING}"></div>' + \
        stmt("OUTSIDE LAY", t_name, None, 870, False, 120)
