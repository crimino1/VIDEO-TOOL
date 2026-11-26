"""Navy 2D infographic scenes. Each returns the full layer HTML for [a, b)."""
from lib import *


def prog(t, d, body, ease="none"):
    """Run JS `body` every frame with p (0..1) over [t, t+d] — for diagrams that move along a path."""
    add_tl(f'tl.fromTo({{p:0}},{{p:0}},{{p:1,duration:{d:.3f},ease:"{ease}",onUpdate:function(){{var p=this.targets()[0].p;{body}}}}},{T(t)});')


def sat_icon(cx, cy, r, t, col=VIOLET, text="SATURN", ringcol=None, tilt=-12, d=0.6, end=None):
    """Flat Saturn: disk + ring ellipse (back half behind, front half over)."""
    gid = nid("si"); rc = ringcol or NEON
    tw(f"#{gid}", {"scale": 1, "opacity": 1}, t, d, {"scale": 0.9, "opacity": 0}, "power2.out")
    if end: tw(f"#{gid}", {"opacity": 0}, s(end) - 0.3, 0.3)
    rx, ry = r * 2.2, r * 0.55
    back = f'<path d="M{cx - rx},{cy} A{rx},{ry} 0 0,1 {cx + rx},{cy}" fill="none" stroke="{rc}" stroke-width="{max(3, r * 0.06):.1f}" opacity=".9"/>'
    front = f'<path d="M{cx - rx},{cy} A{rx},{ry} 0 0,0 {cx + rx},{cy}" fill="none" stroke="{rc}" stroke-width="{max(3, r * 0.06):.1f}"/>'
    tx = (f'<text x="{cx}" y="{cy}" text-anchor="middle" dominant-baseline="central" font-family="Space Mono" font-size="{max(14, r * 0.2):.0f}" letter-spacing="2" fill="#fff">{text}</text>') if text else ""
    return (f'<g id="{gid}" opacity="0" style="transform-origin:{cx}px {cy}px;transform-box:view-box"><g transform="rotate({tilt} {cx} {cy})">{back}'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}"/>{front}</g>{tx}</g>')


# ---------------- hook ----------------
def two_questions(a, b, t1, t2):
    return navy(a, b) + hdr("TWO QUESTIONS", a + 0.1) + svg(
        disk(300, 440, 46, t1, NEON, text="1", tcol=NAVY, tsize=44) + disk(300, 650, 46, t2, NEON, text="2", tcol=NAVY, tsize=44)) +         stmt("WHY DID THE RINGS VANISH IN 2025?", t1, None, 400, True, 66, left=390, width=1400, align="left") +         stmt("WHY WILL THEY VANISH FOR REAL?", t2, None, 610, True, 66, left=390, width=1400, align="left")


def three_teasers(a, b, ts, imgs, labels):
    out = navy(a, b) + hdr("ALONG THE WAY", a + 0.1)
    xs = [420, 960, 1500]
    for x, t, im, lb in zip(xs, ts, imgs, labels):
        out += lens(t, x, 500, 210, im)
        out += lab(lb, t + 0.25, x, 740, anchor="center", size=24)
    return out


# ---------------- size ----------------
def size_compare(a, b, t_x):
    return navy(a, b) + hdr("SATURN VS EARTH", a + 0.1) + svg(
        sat_icon(820, 560, 300, a + 0.2, text="SATURN") + disk(1560, 560, 32, a + 0.6, GREY) +
        line(1440, 560, 1440, 560, a)) + lab("EARTH", a + 0.8, 1560, 610, white=True, anchor="center") + \
        num(1, 9.5, "TIMES WIDER", t_x, 1260, 860, 1.0, dec=1, suffix="×")


def mass_bars(a, b, t_vol, t_mass, t_den):
    W = 1100 / 760
    return navy(a, b) + hdr("VOLUME VS WEIGHT", a + 0.1) + svg(
        bar(360, 400, 760 * W, 70, t_vol, VIOLET, 1.2) + bar(360, 560, 95 * W, 70, t_mass, NEON, 0.8)) + \
        lab("VOLUME", t_vol, 360, 360, white=True) + num(0, 760, "EARTHS FIT INSIDE", t_vol + 0.2, 380, 404, 1.2, size=56) + \
        lab("WEIGHT", t_mass, 360, 520, white=True) + num(0, 95, "EARTHS OF MASS", t_mass + 0.2, 520, 564, 0.9, size=56) + \
        stmt("LEAST DENSE PLANET IN THE SOLAR SYSTEM", t_den, None, 820, False, 62)


def float_tub(a, b, t_float):
    wid = nid("wv"); sid = nid("fs")
    prog(a, s(b) - a, f'var y=Math.sin(p*{(s(b) - a):.2f}*1.6)*10;document.getElementById("{sid}").setAttribute("transform","translate(0,"+y.toFixed(1)+")");')
    water = f'<rect x="260" y="610" width="1400" height="330" fill="{VIOLET}" opacity=".55"/><line x1="260" y1="610" x2="1660" y2="610" stroke="#b9a0ff" stroke-width="3"/>'
    tub = f'<path d="M230,470 L230,950 Q230,980 260,980 L1660,980 Q1690,980 1690,950 L1690,470" fill="none" stroke="#fff" stroke-width="6"/>'
    satg = f'<g id="{sid}">' + sat_icon(960, 590, 170, t_float - 0.6, col=ORANGE, text="SATURN", ringcol=NEON) + '</g>'
    return navy(a, b) + hdr("SATURN WOULD FLOAT", a + 0.1) + svg(fadein(a + 0.2, tub + water) + satg) + \
        lab("WATER · 1.00 G/CM³", a + 0.8, 1700, 640, white=True, anchor="right") + lab("SATURN · 0.69 G/CM³", t_float, 1180, 420)


# ---------------- ring size ----------------
def ring_span(a, b, t_km, t_moon):
    return navy(a, b) + hdr("THE MAIN RINGS", a + 0.1) + svg(
        sat_icon(960, 420, 120, a + 0.1, text=None, ringcol=NEON, tilt=0) +
        line(696, 560, 1224, 560, t_km, 0.8, NEON, 3) + line(696, 545, 696, 575, t_km, 0.2, NEON, 3) + line(1224, 545, 1224, 575, t_km, 0.2, NEON, 3) +
        disk(240, 800, 26, t_moon, "#3a7bd5") + disk(1680, 800, 9, t_moon + 0.3, GREY) + line(268, 800, 1670, 800, t_moon + 0.2, 1.2, RING, 2, dash="6 8") +
        bar(240, 850, 1440 * 280000 / 384400, 14, t_moon + 1.2, NEON, 1.0)) + \
        num(0, 280000, "KM EDGE TO EDGE", t_km, None, 600, 1.2, size=70) + lab("EARTH", t_moon, 240, 740, white=True, anchor="center") + \
        lab("MOON", t_moon + 0.3, 1680, 740, white=True, anchor="center") + lab("384,400 KM", t_moon + 0.5, 960, 760, anchor="center") + \
        lab("RINGS · 3/4 OF THE WAY", t_moon + 1.6, 240, 880)


def thickness(a, b, t_b):
    win = "".join(f'<rect x="{1280 + i * 70}" y="{680 + j * 100}" width="40" height="55" fill="{NEON}" opacity=".85"/>' for i in range(3) for j in range(3))
    bld = f'<rect x="1250" y="650" width="230" height="300" fill="none" stroke="#fff" stroke-width="5"/>{win}'
    ruler = "".join(f'<line x1="1150" y1="{650 + k * 30}" x2="{1170 if k % 5 else 1185}" y2="{650 + k * 30}" stroke="#fff" stroke-width="2"/>' for k in range(11))
    return navy(a, b) + hdr("BUT HOW THICK?", a + 0.1) + svg(
        line(120, 950, 1000, 950, a + 0.3, 1.0, NEON, 6) + fadein(t_b, bld + ruler + '<line x1="1150" y1="650" x2="1150" y2="950" stroke="#fff" stroke-width="2"/>')) + \
        num(0, 10, "METRES THICK", a + 0.6, 140, 820, 0.8, size=96) + lab("RING PLANE (NOT TO SCALE)", a + 0.6, 120, 975, white=True, size=18) + \
        lab("≈ 3-STOREY BUILDING", t_b + 0.3, 1365, 600, anchor="center")


def ring_letters(a, b, times, t_order):
    """Half-view of Saturn at left, rings as arcs; letters D C B A F G E appear at their words."""
    R = {"D": 1.15, "C": 1.4, "B": 1.75, "A": 2.12, "F": 2.33, "G": 2.8, "E": 4.2}
    W_ = {"D": 10, "C": 26, "B": 40, "A": 28, "F": 4, "G": 6, "E": 70}
    OP = {"D": .25, "C": .45, "B": .95, "A": .75, "F": .9, "G": .35, "E": .18}
    k = 330
    out = f'<circle cx="0" cy="560" r="{k}" fill="{ORANGE}"/>'
    for L, t in times.items():
        r = R[L] * k * (0.62 if L == "E" else 1)
        if L == "E": r = 1500
        gid = nid("ra")
        tw(f"#{gid}", {"opacity": 1}, t, 0.5, {"opacity": 0})
        out += (f'<g id="{gid}" opacity="0"><path d="M0,{560 - r} A{r},{r} 0 0,1 0,{560 + r}" fill="none" stroke="{NEON if L in "BA" else "#d8d0ff"}" stroke-width="{W_[L]}" opacity="{OP[L]}"/>'
                f'<text x="{r + (W_[L] / 2 if L != "E" else -60) + 14:.0f}" y="566" font-family="Anton" font-size="54" fill="{NEON}">{L}</text></g>')
    return navy(a, b) + hdr("THE RINGS, INSIDE OUT", a + 0.1, right=True) + svg(fadein(a + 0.1, out)) + \
        stmt("NAMED IN ORDER OF DISCOVERY", t_order, None, 930, True, 58)


def mimas_mass(a, b, t_mimas, t_pct, mimas_img):
    pid = nid("pie")
    r = 210; cx, cy = 1360, 560
    L = 2 * math.pi * (r / 2)
    tw(f"#{pid}", {"strokeDashoffset": L * (1 - 0.4)}, t_pct, 1.2, {"strokeDashoffset": L}, "power2.out")
    pie = (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{GREY}" opacity=".18"/>'
           f'<circle id="{pid}" cx="{cx}" cy="{cy}" r="{r / 2}" fill="none" stroke="{PINK}" stroke-width="{r}" stroke-dasharray="{L:.1f}" stroke-dashoffset="{L:.1f}" transform="rotate(-90 {cx} {cy})"/>')
    return navy(a, b) + hdr("WEIGHING THE RINGS", a + 0.1) + lens(t_mimas, 560, 560, 230, mimas_img) + \
        lab("MIMAS · ~400 KM WIDE", t_mimas + 0.3, 560, 820, white=True, anchor="center") + svg(fadein(t_pct - 0.2, pie)) + \
        num(0, 40, "OF MIMAS", t_pct, 1220, 820, 1.2, suffix="%") + lab("ALL THE RINGS COMBINED", t_pct + 0.4, 1360, 300, anchor="center")


# ---------------- history ----------------
def galileo_timeline(a, b, items, img_main=None):
    """items: [(year, label, t)] along the bottom; optional big lens image."""
    out = navy(a, b) + hdr("SATURN'S VANISHING ACT", a + 0.1)
    n = len(items); x0, x1 = 260, 1660
    sv = line(x0 - 60, 880, x1 + 60, 880, a + 0.2, 1.0, RING, 3)
    for i, (yr, lb, t) in enumerate(items):
        x = x0 + (x1 - x0) * i / max(1, n - 1)
        sv += disk(x, 880, 14, t, NEON)
        out += lab(yr, t, x, 910, anchor="center", size=30) + lab(lb, t + 0.15, x, 960, white=True, anchor="center", size=18)
    return out + svg(sv) + (img_main or "")


def tilt(a, b, t_ang):
    cx, cy = 960, 560
    ax = 27 * math.pi / 180
    x1, y1 = cx - 380 * math.sin(ax), cy - 380 * math.cos(ax)
    x2, y2 = cx + 380 * math.sin(ax), cy + 380 * math.cos(ax)
    arc = f'<path d="M{cx},{cy - 300} A300,300 0 0,0 {cx - 300 * math.sin(ax):.1f},{cy - 300 * math.cos(ax):.1f}" fill="none" stroke="{PINK}" stroke-width="4"/>'
    return navy(a, b) + hdr("TILTED", a + 0.1) + svg(
        sat_icon(cx, cy, 220, a + 0.1, text=None, tilt=-27) + line(cx, cy - 400, cx, cy + 400, a + 0.4, 0.6, RING, 2, dash="8 10") +
        line(x1, y1, x2, y2, t_ang - 0.3, 0.7, "#fff", 3) + fadein(t_ang, arc)) + num(0, 26.7, "DEGREES", t_ang, 1250, 330, 1.0, dec=1, suffix="°")


def orbit_view(a, b, t_29, t_edge, t_top, t_bot):
    """Sun, Earth orbit, Saturn orbit. Saturn travels; its ring keeps its tilt in space, so the inset 'our view' opens and closes."""
    sid, rid, vid, eid = nid("so"), nid("sr"), nid("vr"), nid("eo")
    cx, cy, R1, R2 = 700, 560, 90, 380
    d = s(b) - a
    body = (f'var A=-1.2+p*{d:.2f}*0.32;var x={cx}+{R2}*Math.cos(A),y={cy}+{R2}*0.55*Math.sin(A);'
            f'var g=document.getElementById("{sid}");g.setAttribute("transform","translate("+x.toFixed(1)+","+y.toFixed(1)+")");'
            f'var E=p*{d:.2f}*2.2;document.getElementById("{eid}").setAttribute("cx",({cx}+{R1}*Math.cos(E)).toFixed(1));document.getElementById("{eid}").setAttribute("cy",({cy}+{R1}*0.55*Math.sin(E)).toFixed(1));'
            f'var o=Math.abs(Math.sin(A));document.getElementById("{vid}").setAttribute("ry",(4+150*o).toFixed(1));')
    prog(a, d, body)
    out = (f'<circle cx="{cx}" cy="{cy}" r="46" fill="{ORANGE}"/><ellipse cx="{cx}" cy="{cy}" rx="{R1}" ry="{R1 * .55}" fill="none" stroke="{RING}" stroke-width="2"/>'
           f'<ellipse cx="{cx}" cy="{cy}" rx="{R2}" ry="{R2 * .55}" fill="none" stroke="{RING}" stroke-width="2"/>'
           f'<circle id="{eid}" cx="{cx + R1}" cy="{cy}" r="10" fill="#3a7bd5"/>'
           f'<g id="{sid}"><line x1="-70" y1="-30" x2="70" y2="30" stroke="{NEON}" stroke-width="5"/><circle r="28" fill="{VIOLET}"/></g>')
    view = (f'<circle cx="1530" cy="540" r="250" fill="#000" stroke="#fff" stroke-width="6"/>'
            f'<ellipse id="{vid}" cx="1530" cy="540" rx="200" ry="80" fill="none" stroke="{NEON}" stroke-width="10"/><circle cx="1530" cy="540" r="90" fill="{VIOLET}"/>')
    return navy(a, b) + hdr("WHY THE RINGS VANISH", a + 0.1) + svg(fadein(a + 0.1, out) + fadein(a + 0.6, view)) + \
        lab("SUN", a + 0.4, cx, cy + 56, white=True, anchor="center", size=18) + lab("OUR VIEW", a + 0.8, 1530, 820, anchor="center") + \
        num(0, 29.5, "YEARS PER ORBIT", t_29, 260, 900, 0.9, dec=1, size=70) + \
        lab("LOOKING DOWN ON TOP", t_top, 1530, 230, white=True, anchor="center", end=t_bot) + lab("LOOKING UP AT THE BOTTOM", t_bot, 1530, 230, white=True, anchor="center", end=t_edge) + \
        lab("EDGE-ON EVERY 13–15 YEARS", t_edge, 1530, 230, anchor="center")


def crossings(a, b, ts):
    yrs = [("2009", "PREVIOUS CROSSING"), ("2025", "MARCH 23"), ("EARLY 2030S", "WIDEST OPEN"), ("2038–39", "THREE CROSSINGS")]
    out = navy(a, b) + hdr("RING PLANE CROSSINGS", a + 0.1)
    sv = line(200, 600, 1720, 600, a + 0.2, 1.0, RING, 3)
    xs = [300, 700, 1120, 1580]
    for (y_, l_), x, t in zip(yrs, xs, ts):
        sv += disk(x, 600, 18 if y_ != "2025" else 26, t, PINK if y_ == "2025" else NEON)
        out += lab(y_, t, x, 470, anchor="center", size=44) + lab(l_, t + 0.15, x, 650, white=True, anchor="center", size=20)
    return out + svg(sv)


# ---------------- ring rain ----------------
def charging(a, b, t_uv, t_mm, t_e, t_charge, t_mag):
    cx, cy = 960, 560
    uv = "".join(f'<path d="M{200 + i * 0},{300 + i * 140} q30,-20 60,0 t60,0 t60,0 t60,0 t60,0" fill="none" stroke="#b07cff" stroke-width="4"/>' for i in range(4))
    mm = "".join(f'<circle cx="{1500 + i * 60}" cy="{260 + i * 120}" r="7" fill="{ORANGE}"/><line x1="{1500 + i * 60}" y1="{260 + i * 120}" x2="{1600 + i * 60}" y2="{200 + i * 120}" stroke="{ORANGE}" stroke-width="2" opacity=".6"/>' for i in range(3))
    els = ""
    for i in range(7):
        ang = i * 0.9 + 0.3; gid = nid("el")
        tw(f"#{gid}", {"x": 330 * math.cos(ang), "y": 330 * math.sin(ang), "opacity": 1}, t_e + i * 0.08, 1.4, {"x": 0, "y": 0, "opacity": 0}, "power2.out")
        els += f'<g id="{gid}" opacity="0"><circle cx="{cx}" cy="{cy}" r="12" fill="#7fd6ff"/><text x="{cx}" y="{cy + 1}" font-family="Space Mono" font-size="14" text-anchor="middle" dominant-baseline="central" fill="{NAVY}">e</text></g>'
    plus = f'<text x="{cx}" y="{cy + 6}" text-anchor="middle" dominant-baseline="central" font-family="Anton" font-size="120" fill="{NAVY}">+</text>'
    gid = nid("gr")
    tw(f"#{gid} circle", {"fill": PINK}, t_charge, 0.5)
    return navy(a, b) + hdr("HOW A GRAIN GETS CHARGED", a + 0.1) + svg(
        f'<g id="{gid}"><circle cx="{cx}" cy="{cy}" r="120" fill="{GREY}"/></g>' + fadein(t_uv, uv, dy=0) + fadein(t_mm, mm) + els + fadein(t_charge, plus)) + \
        lab("ICE GRAIN", a + 0.3, cx, 720, white=True, anchor="center") + lab("ULTRAVIOLET LIGHT", t_uv, 200, 240) + lab("MICROMETEOROIDS", t_mm, 1500, 180) + \
        lab("ELECTRONS KNOCKED LOOSE", t_e + 0.3, cx, 960, anchor="center") + lab("NOW SATURN'S MAGNETIC FIELD CAN GRAB IT", t_mag, cx, 1010, white=True, anchor="center")


def lifetime_bars(a, b, rows, title):
    """rows: [(label, value_myr, colour, t)] horizontal bars up to max."""
    mx = max(r[1] for r in rows)
    out = navy(a, b) + hdr(title, a + 0.1)
    sv = ""
    for i, (lb, v, col, t) in enumerate(rows):
        y = 380 + i * 170
        sv += bar(300, y, 1300 * v / mx, 60, t, col, 1.0)
        out += lab(lb, t, 300, y - 40, white=True) + num(v, v, "MILLION YEARS", t + 0.4, 320 + 1300 * v / mx, y - 6, 0.1, size=56)
    return out + svg(sv)


def gap(a, b, t_gap, t_speed):
    return navy(a, b) + hdr("THE GRAND FINALE", a + 0.1) + svg(
        f'<path d="M-100,1150 Q960,780 2020,1150 Z" fill="{ORANGE}"/>' +
        line(0, 330, 1920, 330, a + 0.2, 1.0, "#d8d0ff", 18, op=0.5) + line(960, 440, 960, 880, t_gap, 0.6, NEON, 3) +
        f'<circle cx="960" cy="640" r="12" fill="#fff"/>') + \
        lab("CLOUD TOPS", a + 0.4, 960, 980, anchor="center") + lab("INNERMOST RING", a + 0.4, 960, 270, white=True, anchor="center") + \
        num(0, 2400, "KM GAP", t_gap, 1010, 600, 1.0, size=80) + num(0, 100000, "KM/H", t_speed, 260, 600, 1.2, size=64, prefix="> ")


def chem_list(a, b, items):
    out = navy(a, b) + hdr("FALLING INTO SATURN", a + 0.1)
    for i, (txt, t) in enumerate(items):
        out += box(txt, t, 300 + (i % 3) * 460, 400 + (i // 3) * 140, kind="v" if i % 2 else "")
    return out


def deep_time(a, b, marks, title="DEEP TIME", span=500):
    """Horizontal axis from `span` million years ago to now; marks [(myr, label, colour, t, row)]."""
    x0, x1 = 160, 1760
    X = lambda m: x1 - (x1 - x0) * m / span
    out = navy(a, b) + hdr(title, a + 0.1)
    sv = line(x0, 640, x1, 640, a + 0.2, 1.0, RING, 3)
    for m in range(0, span + 1, 100):
        sv += line(X(m), 630, X(m), 650, a + 0.4, 0.2, RING, 2)
        out += lab(f"{m} MYA" if m else "NOW", a + 0.5, X(m), 670, white=True, anchor="center", size=16)
    for m, lb, col, t, row in marks:
        y = 640 - 70 - row * 80
        sv += disk(X(m), 640, 12, t, col) + line(X(m), 628, X(m), y + 20, t, 0.4, col, 2)
        out += lab(lb, t + 0.1, X(m), y - 10, anchor="center", size=22)
    return out + svg(sv)


def debate(a, b, t_young, t_old, t_q):
    return navy(a, b) + hdr("THE GREAT RING DEBATE", a + 0.1) + svg(line(960, 260, 960, 960, a + 0.2, 0.6, RING, 2)) + \
        stmt("YOUNG", t_young, None, 330, False, 110, left=0, width=960) + \
        num(400, 400, "MILLION YEARS OR LESS", t_young + 0.3, 140, 520, 0.1, size=72) + lab("DUST BUILD-UP · KEMPF 2023", t_young + 0.5, 480, 640, white=True, anchor="center") + \
        stmt("OLD", t_old, None, 330, False, 110, left=960, width=960) + \
        num(4.5, 4.5, "BILLION YEARS", t_old + 0.3, 1180, 520, 0.1, dec=1, size=72) + lab("SELF-CLEANING · HYODO 2024", t_old + 0.5, 1440, 640, white=True, anchor="center") + \
        stmt("?", t_q, None, 760, True, 140)


def uncertain(a, b, items):
    out = navy(a, b) + hdr("WHAT WE DON'T KNOW", a + 0.1)
    for i, (txt, t) in enumerate(items):
        out += box("? " + txt, t, 260, 360 + i * 120, kind="p" if i == len(items) - 1 else "")
    return out


def namecard(a, b, top, big, sub=None, t_sub=None, line2=None, t2=None):
    out = navy(a, b) + hdr(top, a + 0.1) + stmt(big, a + 0.3, None, 430, True, 120)
    if sub: out += lab(sub, t_sub or a + 0.8, 960, 590, anchor="center", size=28)
    if line2: out += stmt(line2, t2, None, 760, False, 70)
    return out


def bignum(a, b, title, n0, n1, unit, t, dec=0, prefix="", suffix="", sub=None, t_sub=None, icon=None):
    out = navy(a, b) + hdr(title, a + 0.1) + num(n0, n1, unit, t, None, 440, 1.3, dec=dec, prefix=prefix, suffix=suffix, size=170)
    if sub: out += stmt(sub, t_sub or t + 1.0, None, 700, True, 58)
    return out + (svg(icon) if icon else "")


def listcard(a, b, title, items, kinds=None):
    out = navy(a, b) + hdr(title, a + 0.1)
    for i, (txt, t) in enumerate(items):
        out += box(txt, t, 260, 330 + i * 125, kind=(kinds[i] if kinds else ""))
    return out


def lenses(a, b, title, items):
    """items: [(img_path, label, t)] in a row."""
    out = navy(a, b) + hdr(title, a + 0.1)
    n = len(items); xs = [960] if n == 1 else [300 + i * (1320 / (n - 1)) for i in range(n)]
    r = 230 if n <= 2 else 200
    for x, (im, lb, t) in zip(xs, items):
        out += lens(t, int(x), 520, r, im) + lab(lb, t + 0.2, int(x), 780, anchor="center", size=24)
    return out
