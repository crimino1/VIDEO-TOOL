"""The 2D animated scenes. Each returns the inner HTML of one full-screen layer and adds its own tweens."""
import math
from lib import *

SVG0 = '<svg class="full" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">'
TXT = 'font-family="League Gothic" fill="#f2f6f8"'


def pop(sel, t, d=0.5, scale=0.85):
    tw(sel, {"opacity": 1, "scale": 1}, t, d, {"opacity": 0, "scale": scale}, "back.out(1.6)")


def show(sel, t, d=0.5, y=20):
    tw(sel, {"opacity": 1, "y": 0}, t, d, {"opacity": 0, "y": y}, "power2.out")


def hide(sel, t, d=0.35):
    tw(sel, {"opacity": 0}, t, d, None, "power1.in")


def draw(sel, t, d=1.0, ease="power1.inOut"):
    """Line drawing: elements carry pathLength=1 and a dash of 1."""
    tw(sel, {"strokeDashoffset": 0}, t, d, {"strokeDashoffset": 1}, ease)


def counter(eid, t, d, v0, v1, fmt="{:,.0f}", suffix=""):
    add_tl(f'tl.to({{v:{v0}}},{{v:{v1},duration:{d:.3f},ease:"power2.out",onUpdate:function(){{var e=document.getElementById("{eid}");if(e)e.textContent=("{fmt}"==="int"?Math.round(this.targets()[0].v).toLocaleString("en-US"):this.targets()[0].v.toFixed(1))+"{suffix}"}}}},{T(t)});')


# ---------------- 0:00 depth counter over the descent ----------------
def depth_open(a, b):
    c = nid("c")
    counter(c, s(a) + 0.4, 3.4, 0, 2000, "int", " M")
    show(f"#{c}", s(a) + 0.3, 0.8)
    sub = nid("c"); show(f"#{sub}", s(a) + 1.8, 0.8)
    hide(f"#{c}", s(b) - 0.5); hide(f"#{sub}", s(b) - 0.5)
    return (fade_in_black(a, 1.5) + f'<div id="{c}" class="big" style="top:400px">0 M</div>'
            f'<div id="{sub}" class="bigsub" style="top:600px">BELOW THE SOUTHERN OCEAN</div>')


# ---------------- eye comparisons ----------------
def eye_compare(a, b, three=True, times=None):
    """Human 2.5 cm, blue whale 15 cm, colossal squid 27 cm, drawn to one scale."""
    px = 21.0  # px per cm
    items = [("HUMAN", 2.5, "#6f8a7a"), ("BLUE WHALE", 15, "#5b7486"), ("COLOSSAL SQUID", 27, "#8fa6b4")]
    if not three: items = items[1:]
    times = times or [s(a) + 0.3 + i * 1.2 for i in range(len(items))]
    base = 770
    xs = [430, 900, 1450] if three else [620, 1300]
    out = bg2d(a, b, "dark") + SVG0
    out += f'<line id="{nid("ln")}" x1="140" y1="{base + 20}" x2="1780" y2="{base + 20}" stroke="#40525e" stroke-width="2"/>'
    for (name, cm, col), x, t in zip(items, xs, times):
        g = nid("g"); r = cm * px / 2
        out += f'<g id="{g}" style="opacity:0;transform-origin:{x}px {base - r}px">{eye_svg(x, base - r, r, col)}'
        out += f'<text x="{x}" y="{base + 80}" text-anchor="middle" {TXT} font-size="56">{name}</text>'
        out += f'<text x="{x}" y="{base + 132}" text-anchor="middle" font-family="Inter" font-weight="700" fill="#9fb4c0" font-size="34">{cm:g} CM</text></g>'
        pop(f"#{g}", t, 0.7, 0.6)
    out += "</svg>"
    return out


def dino(a, b):
    p = fitted("ichthy", 1800, 1000)
    i = nid("ph")
    tw(f"#{i}", {"scale": 1.12}, a, s(b) - s(a), {"scale": 1.0}, "none")
    return (f'<img class="fill" src="{blurbg("ichthy")}" alt=""><div class="card" style="left:260px;top:120px;width:1400px;height:780px">'
            f'<img id="{i}" src="{p}" alt="ichthyosaur" style="width:1400px;height:780px;object-fit:cover;transform-origin:30% 45%"></div>'
            + label("ICHTHYOSAUR SKULL", s(a) + 0.6, 340, 160) + stamp("STILL SMALLER EYES", s(a) + 2.2, y=930, size=70) + credit("Temnodontosaurus fossil · Wikimedia Commons"))


# ---------------- fragments come together ----------------
def fragments(a, b, t_hooks, t_beaks, t_bodies, t_join):
    out = bg2d(a, b, "dark")
    cards = [("scars_skin", "HOOK MARKS IN WHALE SKIN", t_hooks, 170), ("beak_mh", "BEAKS IN WHALE STOMACHS", t_beaks, 760), ("sq_tepapa1", "BODIES HAULED UP BY FISHERMEN", t_bodies, 1350)]
    ids = []
    for name, txt, t, x in cards:
        c = nid("cd"); ids.append(c)
        p = fitted(name, 800, 800, (0.1, 0.1, 0.9, 0.75) if name == "sq_tepapa1" else None)
        out += (f'<div id="{c}" class="fcard" style="left:{x}px;top:200px;opacity:0"><img src="{p}" alt="{name}" style="width:400px;height:480px;object-fit:cover">'
                f'<div class="fcap">{txt}</div></div>')
        tw(f"#{c}", {"opacity": 1, "y": 0, "rotation": (-3 if x < 700 else 3 if x > 1000 else 0)}, t, 0.6, {"opacity": 0, "y": 60, "rotation": 0}, "power3.out")
    for c in ids:
        tw(f"#{c}", {"scale": 0.25, "x": 0, "opacity": 0}, t_join, 1.0, None, "power2.in")
    p, w, h = cutout("colossal_side")
    sw = 1500; sh = int(h * sw / w); sq = nid("sq")
    out += f'<img id="{sq}" src="{p}" alt="colossal squid" style="position:absolute;left:{(1920 - sw) // 2}px;top:{(1080 - sh) // 2}px;width:{sw}px;height:{sh}px;opacity:0">'
    tw(f"#{sq}", {"opacity": 1, "scale": 1}, s(t_join) + 0.7, 1.4, {"opacity": 0, "scale": 0.8}, "power2.out")
    tw(f"#{sq}", {"x": -40}, s(t_join) + 0.7, s(b) - s(t_join) - 0.7, {"x": 40}, "none")
    out += stamp("A PICTURE MADE OF PIECES", s(t_join) + 1.4, y=880, size=70)
    return out


# ---------------- the south polar map ----------------
def southmap(a, b, focus="overview", t_pin=None, pin_text=None, extra=""):
    pl = MAP["places"]
    g = nid("mp")
    out = bg2d(a, b, "dark") + SVG0
    out += '<defs><radialGradient id="ocn" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#0d2635"/><stop offset="1" stop-color="#03090e"/></radialGradient></defs>'
    out += f'<g id="{g}" style="transform-origin:960px 540px">'
    out += '<rect x="-1500" y="-1500" width="4920" height="4080" fill="url(#ocn)"/>'
    for lat, rr in MAP["circles"].items():
        out += f'<circle cx="960" cy="540" r="{rr:.0f}" fill="none" stroke="#2b4656" stroke-width="1.5" stroke-dasharray="6 10" opacity=".7"/>'
    if focus == "range":
        rid = nid("rg")
        out += f'<circle id="{rid}" cx="960" cy="540" r="{(MAP["circles"]["-60"] + MAP["circles"]["-70"]) / 2:.0f}" fill="none" stroke="#3fc6ff" stroke-width="{MAP["circles"]["-60"] - MAP["circles"]["-70"]:.0f}" opacity="0"/>'
        tw(f"#{rid}", {"opacity": 0.22}, s(a) + 0.6, 1.4, {"opacity": 0})
        tw(f"#{rid}", {"opacity": 0.1}, s(a) + 2.2, 2.0, None, "sine.inOut")
        tw(f"#{rid}", {"opacity": 0.25}, s(a) + 4.2, 2.0, None, "sine.inOut")
    out += f'<path d="{MAP["land"]}" fill="#c9d6dc" stroke="#ffffff" stroke-width="1" opacity=".92"/>'
    out += f'<text x="960" y="560" text-anchor="middle" {TXT} font-size="64" fill="#1b2a33" letter-spacing="6">ANTARCTICA</text>'
    out += '</g>'
    if focus == "overview":
        tw(f"#{g}", {"scale": 1.18, "rotation": 6, "svgOrigin": "960 540"}, a, s(b) - s(a), {"scale": 0.92, "rotation": 0, "svgOrigin": "960 540"}, "sine.inOut")
        t1 = nid("tx")
        out += f'<text id="{t1}" x="960" y="160" text-anchor="middle" {TXT} font-size="86" letter-spacing="8" opacity="0">THE SOUTHERN OCEAN</text>'
        show(f"#{t1}", s(a) + 0.4, 0.7)
    elif focus in ("ross", "ssi"):
        px, py = pl[focus]
        k = 2.6
        tw(f"#{g}", {"scale": k, "x": (960 - px) * k - (960 - px) * 0, "y": 0, "svgOrigin": f"{px:.0f} {py:.0f}"}, a, min(3.2, s(b) - s(a) - 0.5), {"scale": 1, "x": 0, "y": 0, "svgOrigin": f"{px:.0f} {py:.0f}"}, "power2.inOut")
        tw(f"#{g}", {"x": 960 - px, "y": 540 - py + (60 if focus == "ross" else -40)}, a, min(3.2, s(b) - s(a) - 0.5), {"x": 0, "y": 0}, "power2.inOut")
        tp = t_pin or s(a) + 2.8
        pid = nid("pin")
        out += (f'<g id="{pid}" style="opacity:0;transform-origin:960px {540 + (60 if focus == "ross" else -40)}px"><circle cx="960" cy="{540 + (60 if focus == "ross" else -40)}" r="18" fill="#e0322b"/>'
                f'<circle cx="960" cy="{540 + (60 if focus == "ross" else -40)}" r="40" fill="none" stroke="#e0322b" stroke-width="4"/>'
                f'<text x="1010" y="{556 + (60 if focus == "ross" else -40)}" {TXT} font-size="64">{pin_text}</text></g>')
        pop(f"#{pid}", tp, 0.6, 0.4)
    elif focus == "range":
        tw(f"#{g}", {"scale": 1.08, "svgOrigin": "960 540"}, a, s(b) - s(a), {"scale": 1.0, "svgOrigin": "960 540"}, "none")
    out += "</svg>" + extra
    return out


# ---------------- light disappears with depth (overlay on the descent) ----------------
def light_fade(a, b, t_red, t_orange, t_yellow, t_blue200, t_1000):
    cols = [("RED", "#e03a2f", t_red), ("ORANGE", "#ef8a2c", t_orange), ("YELLOW", "#f2d23b", t_yellow), ("GREEN", "#3fbf73", t_blue200), ("BLUE", "#3f8cff", t_1000)]
    out = '<div class="spectrum">'
    for name, c, t in cols:
        i = nid("sp")
        out += f'<div id="{i}" class="band"><i style="background:{c}"></i><span>{name}</span></div>'
        show(f"#{i}", s(a) + 0.5, 0.5, 10)
        tw(f"#{i}", {"opacity": 0.12, "x": -30}, t, 1.0, None, "power2.in")
    out += "</div>"
    d = nid("dp")
    counter(d, s(a) + 0.4, s(t_1000) - s(a), 0, 1000, "int", " M")
    show(f"#{d}", s(a) + 0.4, 0.5)
    out += f'<div class="depthbox"><div class="dl">DEPTH</div><div id="{d}" class="dv">0 M</div></div>'
    return out


# ---------------- ocean column with depth zones ----------------
def zones(a, b, mode="adult", t_band=None):
    out = bg2d(a, b, "dark") + SVG0
    out += ('<defs><linearGradient id="col" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c6f96"/><stop offset=".18" stop-color="#0d3b55"/>'
            '<stop offset=".35" stop-color="#05141e"/><stop offset="1" stop-color="#010305"/></linearGradient></defs>')
    top, bot = 110, 1010  # 0 m to 3000 m
    y = lambda m: top + (bot - top) * m / 3000
    out += f'<rect x="520" y="{top}" width="880" height="{bot - top}" fill="url(#col)" rx="6"/>'
    out += f'<path d="M520,{top} q55,-14 110,0 t110,0 t110,0 t110,0 t110,0 t110,0 t110,0 t110,0" fill="none" stroke="#9fd8f0" stroke-width="3"/>'
    for m in range(0, 3001, 500):
        out += f'<line x1="500" y1="{y(m):.0f}" x2="520" y2="{y(m):.0f}" stroke="#9fb4c0" stroke-width="3"/><text x="488" y="{y(m) + 12:.0f}" text-anchor="end" font-family="Inter" font-weight="700" font-size="32" fill="#9fb4c0">{m:,} m</text>'
    tb = t_band or s(a) + 1.0
    p, w, h = cutout("colossal_side")
    if mode == "adult":
        bid = nid("bd")
        out += f'<rect id="{bid}" x="520" y="{y(1000):.0f}" width="880" height="{y(2000) - y(1000):.0f}" fill="#e0322b" opacity="0"/>'
        tw(f"#{bid}", {"opacity": 0.22}, tb, 0.8, {"opacity": 0})
        dsh = nid("bd")
        out += f'<rect id="{dsh}" x="520" y="{y(2000):.0f}" width="880" height="{y(2600) - y(2000):.0f}" fill="none" stroke="#e0322b" stroke-width="3" stroke-dasharray="14 12" opacity="0"/>'
        tw(f"#{dsh}", {"opacity": 0.8}, s(tb) + 6.0, 0.6, {"opacity": 0})
        t1, t2 = nid("tx"), nid("tx")
        out += f'<text id="{t1}" x="1430" y="{y(1500) - 10:.0f}" {TXT} font-size="64" opacity="0">ADULTS</text>'
        out += f'<text id="{t2}" x="1430" y="{y(1500) + 50:.0f}" font-family="Inter" font-weight="700" font-size="34" fill="#c9d6dc" opacity="0">1 TO 2 KM DOWN</text>'
        show(f"#{t1}", s(tb) + 0.4); show(f"#{t2}", s(tb) + 0.8)
        t3 = nid("tx")
        out += f'<text id="{t3}" x="1430" y="{y(2300):.0f}" font-family="Inter" font-weight="700" font-size="34" fill="#e0a09a" opacity="0">MAYBE DEEPER</text>'
        show(f"#{t3}", s(tb) + 6.2)
        sw = 300; sh = int(h * sw / w); sid = nid("sq")
        out += f'<image id="{sid}" href="{p}" x="{960 - sw / 2:.0f}" y="{y(1500) - sh / 2:.0f}" width="{sw}" height="{sh}" opacity="0"/>'
        tw(f"#{sid}", {"opacity": 1, "x": -30}, s(tb) + 0.3, s(b) - s(tb) - 0.3, {"opacity": 0, "x": 30}, "none")
        tw(f"#{sid}", {"opacity": 1}, s(tb) + 0.3, 0.8, {"opacity": 0})
    else:  # juveniles near the surface, adults deep
        for (m0, m1, txt, sz, t) in ((300, 900, "YOUNG", 130, s(a) + 0.6), (1000, 2000, "ADULTS", 300, s(a) + 5.0)):
            bid = nid("bd")
            out += f'<rect id="{bid}" x="520" y="{y(m0):.0f}" width="880" height="{y(m1) - y(m0):.0f}" fill="{"#3fc6ff" if m0 < 500 else "#e0322b"}" opacity="0"/>'
            tw(f"#{bid}", {"opacity": 0.2}, t, 0.7, {"opacity": 0})
            tx = nid("tx")
            out += f'<text id="{tx}" x="1430" y="{(y(m0) + y(m1)) / 2 + 20:.0f}" {TXT} font-size="60" opacity="0">{txt}</text>'
            show(f"#{tx}", t + 0.3)
            sh = int(h * sz / w); sid = nid("sq")
            out += f'<image id="{sid}" href="{p}" x="{960 - sz / 2:.0f}" y="{(y(m0) + y(m1)) / 2 - sh / 2:.0f}" width="{sz}" height="{sh}" opacity="0" style="{"filter:saturate(.3) brightness(1.6)" if m0 < 500 else ""}"/>'
            tw(f"#{sid}", {"opacity": 0.9 if m0 < 500 else 1}, t + 0.2, 0.8, {"opacity": 0})
        ar = nid("ar")
        out += f'<path id="{ar}" d="M1180,{y(750):.0f} C1260,{y(1000):.0f} 1260,{y(1300):.0f} 1200,{y(1500):.0f}" fill="none" stroke="#f2f6f8" stroke-width="6" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" marker-end="url(#ah)" opacity="0"/>'
        out += '<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#f2f6f8"/></marker></defs>'
        draw(f"#{ar}", s(a) + 3.0, 1.6)
        tw(f"#{ar}", {"opacity": 1}, s(a) + 3.0, 0.1, {"opacity": 0})
    out += "</svg>"
    return out


# ---------------- thermometer ----------------
def thermo(a, b, t_salt):
    out = bg2d(a, b, "dark") + SVG0
    x, top, bot = 760, 170, 830
    yv = lambda c: bot - (c + 4) / 8 * (bot - top)  # -4..+4 C
    out += f'<rect x="{x - 34}" y="{top - 30}" width="68" height="{bot - top + 60}" rx="34" fill="#13212b" stroke="#5b7486" stroke-width="4"/>'
    out += f'<circle cx="{x}" cy="{bot + 70}" r="70" fill="#13212b" stroke="#5b7486" stroke-width="4"/><circle cx="{x}" cy="{bot + 70}" r="52" fill="#4fb8ff"/>'
    fid = nid("fl")
    out += f'<rect id="{fid}" x="{x - 18}" y="{yv(2):.0f}" width="36" height="{bot + 40 - yv(2):.0f}" rx="18" fill="#4fb8ff" style="transform-origin:{x}px {bot + 40}px"/>'
    tw(f"#{fid}", {"scaleY": 1}, s(a) + 0.3, 1.6, {"scaleY": 0.05}, "power2.out")
    for c in range(-4, 5, 2):
        out += f'<line x1="{x + 40}" y1="{yv(c):.0f}" x2="{x + 64}" y2="{yv(c):.0f}" stroke="#9fb4c0" stroke-width="3"/><text x="{x + 76}" y="{yv(c) + 11:.0f}" font-family="Inter" font-weight="700" font-size="32" fill="#9fb4c0">{c:+d}°C</text>'
    zid = nid("z")
    out += f'<line id="{zid}" x1="{x - 120}" y1="{yv(0):.0f}" x2="{x + 260}" y2="{yv(0):.0f}" stroke="#e8f4fa" stroke-width="3" stroke-dasharray="10 8" opacity="0"/>'
    show(f"#{zid}", s(a) + 1.2, 0.5, 0)
    bid = nid("bd")
    out += f'<rect id="{bid}" x="{x - 60}" y="{yv(2):.0f}" width="120" height="{yv(-1) - yv(2):.0f}" fill="#4fb8ff" opacity="0" rx="10"/>'
    tw(f"#{bid}", {"opacity": 0.25}, s(a) + 1.8, 0.6, {"opacity": 0})
    t1, t2 = nid("tx"), nid("tx")
    out += f'<text id="{t1}" x="1180" y="440" {TXT} font-size="120" opacity="0">−1 TO 2°C</text>'
    out += f'<text id="{t2}" x="1180" y="510" font-family="Inter" font-weight="700" font-size="38" fill="#c9d6dc" opacity="0">JUST ABOVE FREEZING</text>'
    show(f"#{t1}", s(a) + 2.0); show(f"#{t2}", s(a) + 2.5)
    t3 = nid("tx")
    out += f'<text id="{t3}" x="1180" y="640" font-family="Inter" font-weight="700" font-size="38" fill="#8fd4ff" opacity="0">SALT KEEPS IT FROM FREEZING</text>'
    show(f"#{t3}", t_salt)
    out += "</svg>"
    return out


# ---------------- pressure ----------------
CAR = ("M-300,40 L-300,0 Q-298,-30 -262,-36 L-180,-46 L-110,-104 Q-96,-114 -70,-116 L90,-116 Q120,-116 140,-100 L210,-46 L268,-38 Q300,-32 302,0 L302,40 Z")


def pressure(a, b, t_200, t_car, t_all, t_lungs):
    out = bg2d(a, b, "dark") + SVG0
    c = nid("c")
    out += f'<text id="{c}" x="960" y="420" text-anchor="middle" {TXT} font-size="300" opacity="0">200×</text>'
    tw(f"#{c}", {"opacity": 1, "scale": 1, "svgOrigin": "960 330"}, t_200, 0.8, {"opacity": 0, "scale": 1.3, "svgOrigin": "960 330"}, "power3.out")
    tw(f"#{c}", {"opacity": 0}, s(t_car) - 0.4, 0.4)
    t2 = nid("tx")
    out += f'<text id="{t2}" x="960" y="520" text-anchor="middle" font-family="Inter" font-weight="700" font-size="42" fill="#c9d6dc" opacity="0">THE PRESSURE YOU FEEL RIGHT NOW</text>'
    show(f"#{t2}", s(t_200) + 0.6); tw(f"#{t2}", {"opacity": 0}, s(t_car) - 0.4, 0.4)
    # car parked on a 1 cm square
    g = nid("g")
    out += (f'<g transform="translate(-420 -560) scale(1.7)"><g id="{g}" opacity="0"><rect x="560" y="760" width="60" height="60" fill="#e8c7b6" stroke="#fff" stroke-width="3"/>'
            f'<line x1="560" y1="850" x2="620" y2="850" stroke="#9fb4c0" stroke-width="3"/><text x="590" y="900" text-anchor="middle" font-family="Inter" font-weight="700" font-size="30" fill="#9fb4c0">1 CM</text>'
            f'<g id="{g}c"><path d="{CAR}" transform="translate(590 700) scale(.9)" fill="#f2f6f8"/>'
            f'<circle cx="430" cy="736" r="34" fill="#0b141a" stroke="#f2f6f8" stroke-width="8"/><circle cx="752" cy="736" r="34" fill="#0b141a" stroke="#f2f6f8" stroke-width="8"/>'
            f'<line x1="590" y1="740" x2="590" y2="756" stroke="#ff7a6a" stroke-width="10"/></g></g></g>')
    tw(f"#{g}", {"opacity": 1}, t_car, 0.4, {"opacity": 0})
    tw(f"#{g}c", {"y": 0}, t_car, 0.7, {"y": -300}, "bounce.out")
    lb, lb2 = nid("tx"), nid("tx")
    out += f'<text id="{lb}" x="1180" y="700" {TXT} font-size="96" opacity="0">A SMALL CAR</text>'
    out += f'<text id="{lb2}" x="1180" y="790" {TXT} font-size="96" fill="#ffb39e" opacity="0">ON YOUR THUMBNAIL</text>'
    show(f"#{lb}", s(t_car) + 0.4); show(f"#{lb2}", s(t_car) + 0.9)
    for e in (g, lb, lb2): hide(f"#{e}", s(t_all) - 0.4)
    # a body with pressure from every side
    hb = nid("g")
    arrows = ""
    for k in range(18):
        ang = k * math.tau / 18
        cx, cy = 960 + 330 * math.cos(ang), 560 + 330 * math.sin(ang)
        tx, ty = 960 + 230 * math.cos(ang), 560 + 230 * math.sin(ang)
        arrows += f'<line x1="{cx:.0f}" y1="{cy:.0f}" x2="{tx:.0f}" y2="{ty:.0f}" stroke="#4fb8ff" stroke-width="8" marker-end="url(#pa)"/>'
    out += '<defs><marker id="pa" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#4fb8ff"/></marker></defs>'
    out += f'<g id="{hb}" opacity="0">{human(960, 760, 380)}<g id="{hb}a">{arrows}</g></g>'
    tw(f"#{hb}", {"opacity": 1}, t_all, 0.5, {"opacity": 0})
    for k in range(4):
        tw(f"#{hb}a", {"scale": 0.92, "svgOrigin": "960 560"}, s(t_all) + 0.2 + k * 0.8, 0.4, {"scale": 1.06, "svgOrigin": "960 560"}, "power2.in")
    lg = nid("lg")
    out += (f'<g id="{lg}" opacity="0"><path d="M952,480 Q915,486 914,530 Q917,575 952,568 Z" fill="#e88b8b"/>'
            f'<path d="M968,480 Q1005,486 1006,530 Q1003,575 968,568 Z" fill="#e88b8b"/></g>')
    tw(f"#{lg}", {"opacity": 1}, t_lungs, 0.3, {"opacity": 0})
    tw(f"#{lg}", {"scaleX": 0.3, "scaleY": 0.55, "svgOrigin": "960 525"}, s(t_lungs) + 0.4, 1.2, {"scaleX": 1, "scaleY": 1, "svgOrigin": "960 525"}, "power3.in")
    t3 = nid("tx")
    out += f'<text id="{t3}" x="960" y="1000" text-anchor="middle" {TXT} font-size="76" fill="#ff8a7a" opacity="0">YOUR LUNGS WOULD COLLAPSE</text>'
    show(f"#{t3}", s(t_lungs) + 0.4)
    out += "</svg>"
    return out


# ---------------- 495 kg ----------------
def weight(a, b, t_num, t_half, t_heaviest):
    p = fitted("sq_tepapa1", 900, 1200, (0.05, 0.12, 0.95, 0.88))
    i = nid("ph")
    tw(f"#{i}", {"scale": 1.08}, a, s(b) - s(a), {"scale": 1.0}, "none")
    c = nid("c")
    counter(c, t_num, 1.6, 0, 495, "int", " KG")
    out = (bg2d(a, b, "dark") + f'<div class="card" style="left:150px;top:90px;width:690px;height:900px"><img id="{i}" src="{p}" alt="colossal squid specimen" style="width:690px;height:900px;object-fit:cover"></div>'
           f'<div id="{c}" class="big" style="left:900px;right:60px;top:280px;opacity:0">0 KG</div>')
    show(f"#{c}", t_num, 0.4)
    h1, h2 = nid("tx"), nid("tx")
    out += f'<div id="{h1}" class="bigsub" style="left:900px;right:60px;top:500px;opacity:0">ALMOST HALF A TON</div>'
    out += f'<div id="{h2}" class="stamp2" style="left:900px;right:60px;top:610px;opacity:0">HEAVIEST SQUID EVER RECORDED</div>'
    show(f"#{h1}", t_half); show(f"#{h2}", t_heaviest)
    out += credit("Colossal squid specimen, Te Papa · Wikimedia Commons, CC BY-SA 4.0")
    return out


# ---------------- the 2007 longline ----------------
def longline(a, b, t_squid):
    out = bg2d(a, b, "ocean")
    # surface light band at the top
    out += '<div style="position:absolute;left:0;top:0;width:1920px;height:260px;background:linear-gradient(#5fa9c9,rgba(95,169,201,0))"></div>'
    g = nid("g")
    p, w, h = cutout("colossal_side")
    sw = 720; sh = int(h * sw / w)
    out += (f'<div id="{g}" style="position:absolute;left:0;top:0;width:1920px;height:1080px">'
            f'<div style="position:absolute;left:1020px;top:-400px;width:4px;height:1000px;background:#d8e6ec;opacity:.8"></div>'
            f'<svg style="position:absolute;left:880px;top:420px;width:290px;height:420px" viewBox="-60 -10 120 200"><path d="M0,0 C22,8 30,40 26,80 C24,110 14,140 6,160 L22,190 L-22,190 L-6,160 C-14,140 -24,110 -26,80 C-30,40 -22,8 0,0 Z" fill="#5b6870"/><circle cx="-9" cy="22" r="4" fill="#0b141a"/><path d="M26,70 L46,96 L26,100 Z M-26,70 L-46,96 L-26,100 Z" fill="#46525a"/></svg>'
            f'<img id="{g}s" src="{p}" alt="colossal squid" style="position:absolute;left:{1020 - sw // 2 + 90}px;top:{760}px;width:{sw}px;height:{sh}px;transform:rotate(-95deg);opacity:0"></div>')
    tw(f"#{g}", {"y": -360}, a, s(b) - s(a), {"y": 120}, "none")
    tw(f"#{g}s", {"opacity": 1}, t_squid, 1.0, {"opacity": 0})
    out += label("TOOTHFISH", s(a) + 0.8, 1100, 330, end=s(t_squid) + 1.5)
    out += label("COLOSSAL SQUID", s(t_squid) + 0.8, 1180, 560)
    return out


# ---------------- 27 cm eye ----------------
def eye27(a, b, t_lens, t_alive):
    px = 26.0
    r = 27 * px / 2
    cx, cy = 760, 520
    out = bg2d(a, b, "dark") + SVG0 + eye_svg(cx, cy, r)
    rid = nid("rl")
    out += f'<g id="{rid}"><line x1="{cx - r:.0f}" y1="{cy + r + 60:.0f}" x2="{cx + r:.0f}" y2="{cy + r + 60:.0f}" stroke="#f2f6f8" stroke-width="4" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    for k in range(0, 28, 3):
        x = cx - r + k * px
        out += f'<line x1="{x:.0f}" y1="{cy + r + 48:.0f}" x2="{x:.0f}" y2="{cy + r + 72:.0f}" stroke="#9fb4c0" stroke-width="3"/>'
    out += '</g>'
    draw(f"#{rid} line:first-child", s(a) + 0.4, 1.2)
    c = nid("c")
    out += f'<text id="{c}" x="1300" y="470" {TXT} font-size="170" opacity="0">27 CM</text>'
    show(f"#{c}", s(a) + 0.8)
    oid = nid("o")
    out += (f'<defs><radialGradient id="{oid}g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#ffc061"/><stop offset=".55" stop-color="#f28a17"/><stop offset="1" stop-color="#b9530a"/></radialGradient></defs>'
            f'<g id="{oid}" opacity="0"><circle cx="{cx}" cy="{cy}" r="100" fill="url(#{oid}g)"/><ellipse cx="{cx - 30}" cy="{cy - 38}" rx="26" ry="14" fill="#fff" opacity=".35"/><circle cx="{cx + 8}" cy="{cy - 92}" r="6" fill="#5a7a2a"/></g>')
    pop(f"#{oid}", t_lens, 0.6)
    lt = nid("tx")
    out += f'<text id="{lt}" x="1300" y="560" font-family="Inter" font-weight="700" font-size="40" fill="#f0a64a" opacity="0">LENS: ABOUT AN ORANGE</text>'
    show(f"#{lt}", s(t_lens) + 0.3)
    dc = nid("dc")
    out += f'<circle id="{dc}" cx="{cx}" cy="{cy}" r="{r * 1.22:.0f}" fill="none" stroke="#f2f6f8" stroke-width="4" stroke-dasharray="16 14" opacity="0" style="transform-origin:{cx}px {cy}px"/>'
    tw(f"#{dc}", {"opacity": 0.8, "scale": 1}, t_alive, 1.2, {"opacity": 0, "scale": 0.82}, "power2.out")
    at = nid("tx")
    out += f'<text id="{at}" x="1300" y="640" font-family="Inter" font-weight="700" font-size="40" fill="#c9d6dc" opacity="0">ALIVE, MAYBE EVEN LARGER</text>'
    show(f"#{at}", s(t_alive) + 0.4)
    out += "</svg>"
    return out


# ---------------- 2012 vision study ----------------
def graph2012(a, b, t_axes, t_small, t_flat, t_big):
    out = bg2d(a, b, "dark") + SVG0
    x0, y0, x1, y1 = 300, 900, 1650, 200
    out += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="#9fb4c0" stroke-width="4"/><line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y1}" stroke="#9fb4c0" stroke-width="4"/>'
    out += f'<text x="{(x0 + x1) / 2}" y="{y0 + 80}" text-anchor="middle" {TXT} font-size="56">EYE SIZE →</text>'
    out += f'<text x="{x0 - 50}" y="{(y0 + y1) / 2}" text-anchor="middle" {TXT} font-size="56" transform="rotate(-90 {x0 - 50} {(y0 + y1) / 2})">HOW FAR IT CAN SEE →</text>'
    ttl = nid("tx")
    out += f'<text id="{ttl}" x="{x0}" y="140" {TXT} font-size="72" opacity="0">2012 · VISION SCIENTISTS RUN THE NUMBERS</text>'
    show(f"#{ttl}", t_axes)
    small = " ".join(f"{'M' if i == 0 else 'L'}{x0 + (x1 - x0) * i / 60:.0f},{y0 - (y0 - y1) * 0.42 * (1 - math.exp(-i / 9)):.0f}" for i in range(61))
    big = " ".join(f"{'M' if i == 0 else 'L'}{x0 + (x1 - x0) * i / 60:.0f},{y0 - (y0 - y1) * 0.95 * (i / 60) ** 0.8:.0f}" for i in range(61))
    sp, bp_ = nid("cv"), nid("cv")
    out += f'<path id="{sp}" d="{small}" fill="none" stroke="#f0a64a" stroke-width="8" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    out += f'<path id="{bp_}" d="{big}" fill="none" stroke="#3fc6ff" stroke-width="8" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    draw(f"#{sp}", t_small, 2.2)
    draw(f"#{bp_}", t_big, 2.2)
    l1, l2, l3 = nid("tx"), nid("tx"), nid("tx")
    out += f'<text id="{l1}" x="{x1 - 20}" y="{y0 - (y0 - y1) * 0.42 - 26:.0f}" text-anchor="end" {TXT} font-size="52" fill="#f0a64a" opacity="0">SMALL PREY: FISH, SHRIMP</text>'
    out += f'<text id="{l2}" x="{x0 + 520}" y="{y0 - (y0 - y1) * 0.42 + 70:.0f}" font-family="Inter" font-weight="700" font-size="38" fill="#f0a64a" opacity="0">BIGGER EYE, NO REAL GAIN</text>'
    out += f'<text id="{l3}" x="{x1 - 20}" y="{y1 + 10}" text-anchor="end" {TXT} font-size="52" fill="#3fc6ff" opacity="0">HUGE GLOWING ANIMAL</text>'
    show(f"#{l1}", s(t_small) + 1.6); show(f"#{l2}", t_flat); show(f"#{l3}", s(t_big) + 1.6)
    dot = nid("d")
    out += f'<g id="{dot}" opacity="0"><circle cx="{x1}" cy="{y1 + 35}" r="16" fill="#fff"/><text x="{x1 - 30}" y="{y1 + 110}" text-anchor="end" font-family="Inter" font-weight="700" font-size="34" fill="#fff">COLOSSAL SQUID EYE</text></g>'
    pop(f"#{dot}", s(t_big) + 2.3)
    out += "</svg>"
    return out


# ---------------- glow seen from 100 m ----------------
def range100(a, b):
    out = bg2d(a, b, "dark") + SVG0
    out += eye_svg(250, 540, 120)
    wid = nid("wh")
    dots = ""
    import random as _r
    rr = _r.Random(4)
    for _ in range(260):
        x, y = 1300 + rr.uniform(0, 520), 540 + rr.gauss(0, 55)
        dots += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rr.uniform(1.5, 4):.1f}" fill="#7fe0ff" opacity="{rr.uniform(.3, 1):.2f}"/>'
    out += f'<g id="{wid}" opacity="0">{dots}{sperm_svg(1330, 540, 420, "#0a1218", 0.85, flip=False)}</g>'
    tw(f"#{wid}", {"opacity": 1}, s(a) + 0.3, 0.8, {"opacity": 0})
    tw(f"#{wid}", {"x": -60}, s(a), s(b) - s(a), {"x": 0}, "none")
    ln = nid("ln")
    out += f'<line id="{ln}" x1="420" y1="700" x2="1300" y2="700" stroke="#f2f6f8" stroke-width="4" stroke-dasharray="1" pathLength="1" stroke-dashoffset="1"/>'
    draw(f"#{ln}", s(a) + 0.8, 1.2)
    t1 = nid("tx")
    out += f'<text id="{t1}" x="860" y="790" text-anchor="middle" {TXT} font-size="110" opacity="0">100+ METRES</text>'
    show(f"#{t1}", s(a) + 1.6)
    out += "</svg>"
    return out


# ---------------- scale: squid next to a person ----------------
def size_human(a, b):
    p, w, h = cutout("colossal_side")
    ppm = (2600 / 6.4)  # cutout pixels per metre
    k = 330 / ppm        # display: 330 px per metre
    sw, sh = int(w * k), int(h * k)
    out = bg2d(a, b, "dark")
    sid = nid("sq")
    left = 1700 - sw
    out += f'<img id="{sid}" src="{p}" alt="colossal squid" style="position:absolute;left:{left}px;top:{560 - sh // 2}px;width:{sw}px;height:{sh}px;opacity:0">'
    tw(f"#{sid}", {"opacity": 1, "x": 0}, s(a) + 0.2, 0.9, {"opacity": 0, "x": 60}, "power2.out")
    mantle_px = 2.5 * 330
    mx1 = 1700 - (2600 - 2422) * k
    mx0 = mx1 - mantle_px
    ln = nid("ln")
    out += SVG0 + human(260, 860, 1.8 * 330)
    out += f'<line id="{ln}" x1="{mx0:.0f}" y1="{560 + sh / 2 + 40:.0f}" x2="{mx1:.0f}" y2="{560 + sh / 2 + 40:.0f}" stroke="#f2f6f8" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    draw(f"#{ln}", s(a) + 1.4, 1.0)
    t1 = nid("tx")
    out += f'<text id="{t1}" x="{(mx0 + mx1) / 2:.0f}" y="{560 + sh / 2 + 120:.0f}" text-anchor="middle" {TXT} font-size="84" opacity="0">MANTLE: OVER 2 M</text>'
    show(f"#{t1}", s(a) + 2.0)
    out += f'<text x="260" y="930" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" fill="#9fb4c0">1.8 M</text></svg>'
    return out


# ---------------- giant squid vs colossal squid ----------------
def giant_vs(a, b, t_giant, t_whip, t_col, t_tank):
    out = bg2d(a, b, "dark")
    pg, wg, hg = cutout("giant_side"); pc, wc, hc = cutout("colossal_side")
    ppm_g, ppm_c = 3000 / 13.5, 2600 / 6.4
    k = 128.0  # px per metre on screen
    gw, gh = int(wg * k / ppm_g), int(hg * k / ppm_g)
    cw, ch = int(wc * k / ppm_c), int(hc * k / ppm_c)
    gid, cid = nid("sq"), nid("sq")
    out += f'<img id="{gid}" src="{pg}" alt="giant squid" style="position:absolute;left:{1820 - gw}px;top:{300 - gh // 2}px;width:{gw}px;height:{gh}px;opacity:0">'
    out += f'<img id="{cid}" src="{pc}" alt="colossal squid" style="position:absolute;left:{1820 - cw}px;top:{760 - ch // 2}px;width:{cw}px;height:{ch}px;opacity:0">'
    tw(f"#{gid}", {"opacity": 1, "x": 0}, s(a) + 0.3, 0.9, {"opacity": 0, "x": 80}, "power2.out")
    tw(f"#{cid}", {"opacity": 1, "x": 0}, s(a) + 0.8, 0.9, {"opacity": 0, "x": 80}, "power2.out")
    out += SVG0 + human(140, 380, 1.8 * k, op=0.8) + human(140, 840, 1.8 * k, op=0.8)
    l1, l2, l3, l4 = nid("tx"), nid("tx"), nid("tx"), nid("tx")
    out += f'<text id="{l1}" x="100" y="140" {TXT} font-size="80" opacity="0">GIANT SQUID</text>'
    out += f'<text id="{l2}" x="100" y="196" font-family="Inter" font-weight="700" font-size="36" fill="#c9d6dc" opacity="0">LONG AND SLENDER · OVER 10 M · BUILT LIKE A WHIP</text>'
    out += f'<text id="{l3}" x="100" y="590" {TXT} font-size="80" opacity="0">COLOSSAL SQUID</text>'
    out += f'<text id="{l4}" x="100" y="646" font-family="Inter" font-weight="700" font-size="36" fill="#c9d6dc" opacity="0">SHORTER · FAR HEAVIER · BUILT LIKE A TANK</text>'
    show(f"#{l1}", t_giant); show(f"#{l2}", t_whip); show(f"#{l3}", t_col); show(f"#{l4}", t_tank)
    tw(f"#{gid}", {"opacity": 0.35}, t_col, 0.6)
    tw(f"#{cid}", {"scale": 1.06}, t_tank, 0.5, None, "back.out(2)")
    out += "</svg>"
    return out


# ---------------- 8 arms + 2 tentacles ----------------
def arms_count(a, b, t_two):
    p, w, h = cutout("colossal_side")
    sw = 1500; sh = int(h * sw / w)
    out = bg2d(a, b, "dark")
    sid = nid("sq")
    out += f'<img id="{sid}" src="{p}" alt="colossal squid" style="position:absolute;left:300px;top:{540 - sh // 2}px;width:{sw}px;height:{sh}px;opacity:0">'
    tw(f"#{sid}", {"opacity": 1}, s(a) + 0.1, 0.6, {"opacity": 0})
    tw(f"#{sid}", {"x": -60}, a, s(b) - s(a), {"x": 0}, "none")
    c = nid("c")
    counter(c, s(a) + 0.8, 1.8, 0, 8, "int", " ARMS")
    out += f'<div id="{c}" class="big" style="left:80px;top:120px;text-align:left;font-size:150px;opacity:0">0 ARMS</div>'
    show(f"#{c}", s(a) + 0.7)
    t2 = nid("tx")
    out += f'<div id="{t2}" class="big" style="left:80px;top:300px;text-align:left;font-size:110px;color:#ffb39e;opacity:0">+ 2 FEEDING TENTACLES</div>'
    show(f"#{t2}", t_two)
    return out


# ---------------- sucker ring vs hook ----------------
def sucker_vs_hook(a, b, t_hook):
    out = bg2d(a, b, "dark") + SVG0
    teeth = "".join(f'<path d="M{560 + 150 * math.cos(k * math.tau / 28):.1f},{520 + 150 * math.sin(k * math.tau / 28):.1f} L{560 + 118 * math.cos((k + .5) * math.tau / 28):.1f},{520 + 118 * math.sin((k + .5) * math.tau / 28):.1f} L{560 + 150 * math.cos((k + 1) * math.tau / 28):.1f},{520 + 150 * math.sin((k + 1) * math.tau / 28):.1f}" fill="#efe6d0"/>' for k in range(28))
    g1 = nid("g")
    out += f'<g id="{g1}" opacity="0"><circle cx="560" cy="520" r="210" fill="#c0685a"/><circle cx="560" cy="520" r="160" fill="#efe6d0"/><circle cx="560" cy="520" r="150" fill="#5a2a24"/>{teeth}<circle cx="560" cy="520" r="70" fill="#2a120f"/>'
    out += f'<text x="560" y="830" text-anchor="middle" {TXT} font-size="64">MOST SQUID</text><text x="560" y="880" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" fill="#c9d6dc">SUCKER WITH A RING OF TEETH</text></g>'
    pop(f"#{g1}", s(a) + 0.2, 0.6)
    g2 = nid("g")
    out += (f'<g id="{g2}" opacity="0"><circle cx="1360" cy="520" r="210" fill="#7a2a22"/><circle cx="1360" cy="520" r="120" fill="#4a1712"/>'
            f'<path d="M1310,600 C1300,480 1330,380 1420,330 C1450,316 1470,330 1452,350 C1395,400 1385,480 1395,600 Z" fill="#e7c48c" stroke="#3a2a14" stroke-width="5"/>'
            f'<text x="1360" y="830" text-anchor="middle" {TXT} font-size="64">COLOSSAL SQUID</text><text x="1360" y="880" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" fill="#ffb39e">REAL HOOKS</text></g>')
    pop(f"#{g2}", t_hook, 0.7)
    out += "</svg>"
    return out


# ---------------- fixed hook vs swivel hook ----------------
def swivel(a, b, t_spin, t_fixed, t_swivel, t_deeper):
    out = bg2d(a, b, "dark") + SVG0
    hook = 'M-25,60 C-35,-40 -5,-120 80,-160 C110,-174 130,-160 112,-140 C55,-95 45,-20 55,60 Z'
    # intro: one hook spinning in place
    sp = nid("g")
    out += f'<g id="{sp}" opacity="0"><g transform="translate(960 560)"><g id="{sp}r"><path d="{hook}" fill="#e7c48c" stroke="#3a2a14" stroke-width="6"/></g></g>'
    out += f'<path d="M820,700 A150,40 0 1,0 1100,700" fill="none" stroke="#3fc6ff" stroke-width="6" marker-end="url(#sa)"/><text x="960" y="850" text-anchor="middle" {TXT} font-size="80">THEY ROTATE IN PLACE</text></g>'
    out += '<defs><marker id="sa" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#3fc6ff"/></marker></defs>'
    tw(f"#{sp}", {"opacity": 1}, t_spin, 0.5, {"opacity": 0})
    tw(f"#{sp}r", {"scaleX": -1}, s(t_spin) + 0.6, 0.9, {"scaleX": 1}, "sine.inOut")
    tw(f"#{sp}r", {"scaleX": 1}, s(t_spin) + 1.6, 0.9, None, "sine.inOut")
    tw(f"#{sp}r", {"scaleX": -1}, s(t_spin) + 2.6, 0.9, None, "sine.inOut")
    tw(f"#{sp}", {"opacity": 0}, s(t_fixed) - 0.4, 0.4)
    # two panels
    for side, x, t, lab in (("fixed", 520, t_fixed, "FIXED HOOK"), ("swivel", 1400, t_swivel, "SWIVEL HOOK")):
        g = nid("g")
        out += (f'<g id="{g}" opacity="0"><text x="{x}" y="200" text-anchor="middle" {TXT} font-size="76">{lab}</text>'
                f'<g transform="translate({x} 560)"><g id="{g}p"><rect x="-200" y="-140" width="400" height="280" rx="40" fill="#8a9aa3"/>'
                f'<rect x="-200" y="-140" width="400" height="280" rx="40" fill="none" stroke="#c9d6dc" stroke-width="4"/></g>'
                f'<g id="{g}h"><path d="{hook}" transform="translate(-40 -40) scale(1.1)" fill="#e7c48c" stroke="#3a2a14" stroke-width="6"/></g></g></g>')
        tw(f"#{g}", {"opacity": 1}, t, 0.5, {"opacity": 0})
        if side == "fixed":
            tw(f"#{g}p", {"rotation": 35}, s(t) + 0.8, 0.6, None, "power2.inOut")
            tw(f"#{g}p", {"rotation": -30}, s(t) + 1.4, 0.6, None, "power2.inOut")
            tw(f"#{g}h", {"y": -260, "x": 120, "rotation": 50, "opacity": 0.4}, s(t) + 1.7, 0.6, None, "power2.in")
            x_ = nid("x")
            out += f'<text id="{x_}" x="{x}" y="900" text-anchor="middle" {TXT} font-size="64" fill="#ff7a6a" opacity="0">TEARS FREE</text>'
            show(f"#{x_}", s(t) + 2.2)
        else:
            for k, r in enumerate((35, -30, 40, -35)):
                tw(f"#{g}p", {"rotation": r}, s(t) + 0.6 + k * 0.6, 0.6, None, "power2.inOut")
                tw(f"#{g}h", {"rotation": r}, s(t) + 0.6 + k * 0.6, 0.6, None, "power2.inOut")
            x_ = nid("x")
            out += f'<text id="{x_}" x="{x}" y="900" text-anchor="middle" {TXT} font-size="64" fill="#8fe39a" opacity="0">TURNS WITH IT, STAYS IN</text>'
            show(f"#{x_}", t_deeper)
    out += "</svg>"
    return out


# ---------------- whale skin scars ----------------
def scars(a, b, t_match):
    p = fitted("scars_skin", 1600, 1600, (0.0, 0.08, 1.0, 0.8))
    i = nid("ph")
    tw(f"#{i}", {"scale": 1.12}, a, s(b) - s(a), {"scale": 1.0}, "none")
    out = (f'<img class="fill" src="{blurbg("scars_skin")}" alt=""><div class="card" style="left:360px;top:70px;width:1200px;height:900px">'
           f'<img id="{i}" src="{p}" alt="sperm whale skin with sucker scars" style="width:1200px;height:900px;object-fit:cover;transform-origin:50% 45%"></div>')
    out += label("CIRCULAR SCARS", s(a) + 1.2, 420, 130)
    out += stamp("THEY MATCH SQUID HOOKS AND SUCKERS", t_match, y=900, size=66)
    out += credit("Sperm whale skin with squid sucker scars · Wikimedia Commons, public domain")
    return out


# ---------------- parrot beak vs squid beak ----------------
def beak_parrot(a, b, t_chitin):
    out = bg2d(a, b, "warm")
    pp = fitted("parrot", 900, 900); pb = fitted("beak_mh", 900, 900)
    i1, i2 = nid("cd"), nid("cd")
    out += f'<div id="{i1}" class="fcard" style="left:170px;top:150px;opacity:0"><img src="{pp}" alt="parrot" style="width:700px;height:620px;object-fit:cover"><div class="fcap">PARROT</div></div>'
    out += f'<div id="{i2}" class="fcard" style="left:1050px;top:150px;opacity:0"><img src="{pb}" alt="colossal squid beak" style="width:700px;height:620px;object-fit:cover"><div class="fcap">COLOSSAL SQUID BEAK</div></div>'
    show(f"#{i1}", s(a) + 0.2, 0.6, 40); show(f"#{i2}", s(a) + 0.9, 0.6, 40)
    out += stamp("CHITIN + PROTEIN · ONE OF THE HARDEST NATURAL MATERIALS OF ITS KIND", t_chitin, y=860, size=54)
    out += credit("Colossal squid beak · Wikimedia Commons, CC BY-SA 3.0 · Parrot: IslandHopper X, Pexels")
    return out


# ---------------- donut brain ----------------
def brain(a, b, t_ring, t_food, t_big, t_small):
    out = bg2d(a, b, "dark") + SVG0
    cx, cy = 960, 520
    out += f'<defs><linearGradient id="br" x1="0" x2="1"><stop offset="0" stop-color="#d98f8f"/><stop offset=".5" stop-color="#f3c0b6"/><stop offset="1" stop-color="#c77a7a"/></linearGradient></defs>'
    tube = nid("tb")
    out += f'<g id="{tube}" opacity="0"><rect x="{cx - 46}" y="40" width="92" height="1000" rx="46" fill="#5f2a2a"/><rect x="{cx - 30}" y="40" width="60" height="1000" rx="30" fill="#7c3a36"/></g>'
    ring_b = nid("rb"); ring_f = nid("rf")
    # back half of the ring (behind the tube) and front half (over it)
    out += f'<path id="{ring_b}" d="M{cx - 330},{cy} A330,120 0 0,1 {cx + 330},{cy} L{cx + 140},{cy} A140,46 0 0,0 {cx - 140},{cy} Z" fill="url(#br)" opacity="0"/>'
    foods = ""
    for k in range(4):
        fid = nid("fd")
        foods += f'<circle id="{fid}" cx="{cx}" cy="0" r="20" fill="#e0c37a" opacity="0"/>'
        tw(f"#{fid}", {"y": 1100, "opacity": 1}, s(t_food) + k * 0.9, 2.2, {"y": 0, "opacity": 1}, "none")
    big = nid("bg")
    foods += f'<circle id="{big}" cx="{cx}" cy="0" r="62" fill="#e0c37a" opacity="0"/>'
    tw(f"#{big}", {"y": cy - 120, "opacity": 1}, t_big, 1.0, {"y": 0, "opacity": 1}, "power2.in")
    tw(f"#{big}", {"opacity": 0}, s(t_small) - 0.2, 0.2)
    for k in range(6):
        sid = nid("sm")
        foods += f'<circle id="{sid}" cx="{cx + (k % 3 - 1) * 10}" cy="{cy - 120}" r="14" fill="#e0c37a" opacity="0"/>'
        tw(f"#{sid}", {"y": 700, "opacity": 1}, s(t_small) + k * 0.25, 1.6, {"y": 0, "opacity": 1}, "none")
    out += foods
    out += f'<path id="{ring_f}" d="M{cx - 330},{cy} A330,120 0 0,0 {cx + 330},{cy} L{cx + 140},{cy} A140,46 0 0,1 {cx - 140},{cy} Z" fill="url(#br)" opacity="0"/>'
    for sel in (ring_b, ring_f):
        tw(f"#{sel}", {"opacity": 1}, t_ring, 0.7, {"opacity": 0})
    tw(f"#{tube}", {"opacity": 1}, s(t_ring) + 1.2, 0.6, {"opacity": 0})
    warn = nid("w")
    tw(f"#{ring_f}", {"fill": "#ff5a4a"}, s(t_big) + 0.8, 0.3)
    tw(f"#{ring_f}", {"fill": "#f3c0b6"}, s(t_big) + 1.6, 0.4)
    l1, l2 = nid("tx"), nid("tx")
    out += f'<text id="{l1}" x="{cx + 360}" y="{cy - 30}" {TXT} font-size="72" opacity="0">BRAIN</text>'
    out += f'<text id="{l2}" x="{cx + 70}" y="900" {TXT} font-size="72" opacity="0">FOOD TUBE (ESOPHAGUS)</text>'
    show(f"#{l1}", s(t_ring) + 0.6); show(f"#{l2}", s(t_ring) + 1.6)
    w2 = nid("tx")
    out += f'<text id="{warn}" x="{cx - 380}" y="{cy - 160}" text-anchor="end" {TXT} font-size="64" fill="#ff7a6a" opacity="0">TOO BIG</text>'
    show(f"#{warn}", s(t_big) + 0.8); hide(f"#{warn}", s(t_small) - 0.2)
    out += f'<text id="{w2}" x="{cx - 380}" y="{cy - 160}" text-anchor="end" {TXT} font-size="64" fill="#8fe39a" opacity="0">SHREDDED FIRST</text>'
    show(f"#{w2}", s(t_small) + 0.2)
    out += "</svg>"
    return out


# ---------------- three hearts ----------------
def hearts(a, b, t_two, t_third):
    p, w, h = cutout("colossal_side")
    sw = 1500; sh = int(h * sw / w)
    out = bg2d(a, b, "dark")
    out += f'<img src="{p}" alt="colossal squid" style="position:absolute;left:220px;top:{560 - sh // 2}px;width:{sw}px;height:{sh}px;opacity:.28">'
    out += SVG0
    heart = "M0,30 C-50,-10 -40,-60 0,-35 C40,-60 50,-10 0,30 Z"
    pos = [(1020, 470, t_two), (1020, 650, t_two), (1180, 560, t_third)]
    for k, (x, y, t) in enumerate(pos):
        g = nid("ht")
        out += f'<g transform="translate({x} {y})"><g id="{g}" opacity="0"><path d="{heart}" transform="scale(1.4)" fill="{"#4f9dff" if k < 2 else "#ff6a5a"}" stroke="#fff" stroke-width="2"/></g></g>'
        pop(f"#{g}", t, 0.5)
        for j in range(int((s(b) - s(t)) / 0.9)):
            tw(f"#{g}", {"scale": 1.18}, s(t) + 0.6 + j * 0.9, 0.12, None, "power2.out")
            tw(f"#{g}", {"scale": 1.0}, s(t) + 0.72 + j * 0.9, 0.3, None, "power2.in")
    l1, l2 = nid("tx"), nid("tx")
    out += f'<text id="{l1}" x="760" y="300" {TXT} font-size="64" opacity="0">TWO FOR THE GILLS</text>'
    out += f'<text id="{l2}" x="1240" y="860" {TXT} font-size="64" opacity="0">ONE FOR THE BODY</text>'
    show(f"#{l1}", s(t_two) + 0.4); show(f"#{l2}", s(t_third) + 0.4)
    c = nid("c")
    out += f'<text id="{c}" x="100" y="180" {TXT} font-size="140" opacity="0">3 HEARTS</text>'
    show(f"#{c}", s(a) + 0.2)
    out += "</svg>"
    return out


# ---------------- copper blood ----------------
def blood(a, b, t_blue, t_iron, t_copper, t_cold):
    out = bg2d(a, b, "dark") + SVG0
    def vial(x, col, fill_id):
        return (f'<rect x="{x - 70}" y="300" width="140" height="440" rx="70" fill="#0f1a21" stroke="#9fb4c0" stroke-width="5"/>'
                f'<rect id="{fill_id}" x="{x - 56}" y="420" width="112" height="306" rx="56" fill="{col}" style="transform-origin:{x}px 726px"/>')
    v1, v2 = nid("v"), nid("v")
    g1, g2 = nid("g"), nid("g")
    out += f'<g id="{g1}" opacity="0">{vial(560, "#b3121f", v1)}<text x="560" y="820" text-anchor="middle" {TXT} font-size="64">US</text></g>'
    out += f'<g id="{g2}" opacity="0">{vial(1360, "#2f6fe0", v2)}<text x="1360" y="820" text-anchor="middle" {TXT} font-size="64">SQUID</text></g>'
    show(f"#{g1}", s(a) + 0.2); show(f"#{g2}", t_blue)
    tw(f"#{v2}", {"scaleY": 1}, t_blue, 1.0, {"scaleY": 0.1}, "power2.out")
    def tile(x, sym, name, col):
        return (f'<rect x="{x - 80}" y="80" width="160" height="170" rx="10" fill="{col}"/><text x="{x}" y="200" text-anchor="middle" font-family="Inter" font-weight="900" font-size="90" fill="#fff">{sym}</text>'
                f'<text x="{x}" y="236" text-anchor="middle" font-family="Inter" font-weight="700" font-size="24" fill="#fff">{name}</text>')
    t1, t2 = nid("g"), nid("g")
    out += f'<g id="{t1}" opacity="0">{tile(560, "Fe", "IRON", "#7a2a22")}<text x="560" y="900" text-anchor="middle" font-family="Inter" font-weight="700" font-size="34" fill="#c9d6dc">HEMOGLOBIN</text></g>'
    out += f'<g id="{t2}" opacity="0">{tile(1360, "Cu", "COPPER", "#1f5a8a")}<text x="1360" y="900" text-anchor="middle" font-family="Inter" font-weight="700" font-size="34" fill="#c9d6dc">HEMOCYANIN</text></g>'
    pop(f"#{t1}", t_iron); pop(f"#{t2}", t_copper)
    c = nid("tx")
    out += f'<text id="{c}" x="960" y="1010" text-anchor="middle" {TXT} font-size="64" fill="#8fd4ff" opacity="0">BETTER IN COLD WATER WITH LITTLE OXYGEN</text>'
    show(f"#{c}", t_cold)
    out += "</svg>"
    return out


def recap(a, b, times):
    items = ["THREE HEARTS", "BLUE BLOOD", "A BRAIN AROUND ITS THROAT", "AN EYE BIGGER THAN A WHALE'S"]
    out = bg2d(a, b, "dark")
    for k, (txt, t) in enumerate(zip(items, times)):
        i = nid("rc")
        out += f'<div id="{i}" class="recap" style="top:{170 + k * 190}px;opacity:0">{txt}</div>'
        show(f"#{i}", t, 0.5, 30)
    return out


# ---------------- slow metabolism ----------------
def metab_a(a, b, t_slow):
    out = bg2d(a, b, "dark") + SVG0
    t1 = nid("tx")
    out += f'<text id="{t1}" x="960" y="200" text-anchor="middle" {TXT} font-size="110" opacity="0">2010 · HOW MUCH ENERGY DOES IT BURN?</text>'
    show(f"#{t1}", s(a) + 0.3)
    cx, cy, r = 960, 760, 300
    arc = f"M{cx - r},{cy} A{r},{r} 0 0,1 {cx + r},{cy}"
    out += f'<path d="{arc}" fill="none" stroke="#1d2f3a" stroke-width="46"/>'
    out += f'<path d="M{cx - r},{cy} A{r},{r} 0 0,1 {cx - r * 0.5:.0f},{cy - r * 0.866:.0f}" fill="none" stroke="#3fc6ff" stroke-width="46"/>'
    out += f'<path d="M{cx + r * 0.5:.0f},{cy - r * 0.866:.0f} A{r},{r} 0 0,1 {cx + r},{cy}" fill="none" stroke="#e0322b" stroke-width="46"/>'
    out += f'<text x="{cx - r - 10}" y="{cy + 70}" text-anchor="middle" {TXT} font-size="50">SLOW</text><text x="{cx + r + 10}" y="{cy + 70}" text-anchor="middle" {TXT} font-size="50">FAST</text>'
    nd = nid("nd")
    out += f'<g id="{nd}" style="transform-origin:{cx}px {cy}px"><line x1="{cx}" y1="{cy}" x2="{cx}" y2="{cy - r + 40}" stroke="#fff" stroke-width="12" stroke-linecap="round"/><circle cx="{cx}" cy="{cy}" r="26" fill="#fff"/></g>'
    tw(f"#{nd}", {"rotation": 10}, s(a) + 0.5, 1.2, {"rotation": 60}, "power2.inOut")
    tw(f"#{nd}", {"rotation": -72}, t_slow, 2.0, None, "power3.inOut")
    l2 = nid("tx")
    out += f'<text id="{l2}" x="960" y="330" text-anchor="middle" font-family="Inter" font-weight="700" font-size="42" fill="#8fd4ff" opacity="0">COLD WATER + HUGE BODY = LIFE ON A VERY SLOW SETTING</text>'
    show(f"#{l2}", s(t_slow) + 0.5)
    out += "</svg>"
    return out


def metab_b(a, b, t_fish, t_days):
    out = bg2d(a, b, "dark")
    c = nid("c")
    out += f'<div id="{c}" class="big" style="top:110px;opacity:0">30 GRAMS A DAY</div>'
    show(f"#{c}", s(a) + 0.2)
    fish = fitted("tooth_noaa", 900, 600)
    f = nid("cd")
    out += f'<div id="{f}" class="fcard" style="left:160px;top:380px;opacity:0"><img src="{fish}" alt="Antarctic toothfish" style="width:760px;height:470px;object-fit:cover"><div class="fcap">ONE 5 KG TOOTHFISH</div></div>'
    show(f"#{f}", t_fish, 0.6, 40)
    d = nid("c")
    counter(d, t_days, 2.2, 0, 200, "int", "")
    out += f'<div id="{d}" class="big" style="left:1040px;right:80px;top:430px;font-size:300px;opacity:0">0</div>'
    l = nid("tx")
    out += f'<div id="{l}" class="bigsub" style="left:1040px;right:80px;top:760px;opacity:0">DAYS OF FOOD</div>'
    show(f"#{d}", t_days); show(f"#{l}", s(t_days) + 0.3)
    out += credit("Antarctic toothfish: NOAA · public domain")
    return out


# ---------------- porthole ----------------
def porthole_frame(a, b, t_eye):
    """Ring of the window over everything; the eye clip goes underneath in its own layer."""
    out = SVG0 + '<defs><mask id="ph"><rect width="1920" height="1080" fill="#fff"/><circle cx="960" cy="540" r="380" fill="#000"/></mask>'
    out += '<radialGradient id="rim" cx="50%" cy="50%" r="50%"><stop offset=".8" stop-color="#2a3238"/><stop offset=".9" stop-color="#8d989f"/><stop offset="1" stop-color="#1a1f23"/></radialGradient></defs>'
    out += '<rect width="1920" height="1080" fill="#05080a" mask="url(#ph)"/>'
    out += '<circle cx="960" cy="540" r="430" fill="none" stroke="url(#rim)" stroke-width="100"/>'
    for k in range(12):
        ang = k * math.tau / 12
        out += f'<circle cx="{960 + 430 * math.cos(ang):.0f}" cy="{540 + 430 * math.sin(ang):.0f}" r="14" fill="#b9c3c9"/>'
    out += '<circle cx="960" cy="540" r="380" fill="none" stroke="#9fd8f0" stroke-width="2" opacity=".25"/></svg>'
    return out


# ---------------- 1925 ----------------
def robson(a, b, t_name):
    out = bg2d(a, b, "warm")
    t1, t2, t3 = nid("tx"), nid("tx"), nid("tx")
    out += f'<div id="{t1}" class="bigsub" style="top:250px;opacity:0;letter-spacing:6px">1925 · GUY COBURN ROBSON DESCRIBES A NEW SPECIES</div>'
    out += f'<div id="{t2}" class="latin" style="top:390px;opacity:0">Mesonychoteuthis hamiltoni</div>'
    out += f'<div id="{t3}" class="bigsub" style="top:620px;opacity:0;color:#d9b48a">FROM TWO ARMS FOUND IN A SPERM WHALE</div>'
    show(f"#{t1}", s(a) + 0.3); tw(f"#{t2}", {"opacity": 1, "letterSpacing": "2px"}, t_name, 1.4, {"opacity": 0, "letterSpacing": "24px"}, "power2.out")
    show(f"#{t3}", s(t_name) + 1.6)
    return out


# ---------------- beaks pile up in a whale's stomach ----------------
def beaks_stomach(a, b, t_tough, t_pile):
    out = bg2d(a, b, "dark") + SVG0
    out += sperm_svg(160, 560, 1600, "#1a242b", 1.0)
    out += '<ellipse cx="900" cy="600" rx="300" ry="150" fill="#3a1f22" stroke="#7a4a4a" stroke-width="5"/>'
    BEAK = "M0,-28 C18,-26 30,-10 28,8 C26,20 14,30 2,30 C10,18 10,4 2,-6 C-6,4 -14,8 -24,6 C-20,-12 -12,-24 0,-28 Z"
    import random as _r
    rr = _r.Random(11)
    for k in range(36):
        bid = nid("bk")
        x, y = 900 + rr.uniform(-230, 230), 640 + rr.uniform(-70, 80)
        t = s(t_pile) + k * 0.12 if k > 3 else s(a) + 0.6 + k * 0.4
        out += f'<g transform="translate({x:.0f} {y:.0f}) rotate({rr.uniform(0, 360):.0f})"><path id="{bid}" d="{BEAK}" fill="#1b0f0a" stroke="#a5795a" stroke-width="2" opacity="0"/></g>'
        tw(f"#{bid}", {"opacity": 1, "y": 0}, t, 0.4, {"opacity": 0, "y": -120}, "bounce.out")
    t1, t2 = nid("tx"), nid("tx")
    out += f'<text id="{t1}" x="960" y="220" text-anchor="middle" {TXT} font-size="96" opacity="0">BEAKS DON\'T DIGEST</text>'
    out += f'<text id="{t2}" x="960" y="950" text-anchor="middle" {TXT} font-size="80" fill="#e0a09a" opacity="0">SOMETIMES DOZENS IN ONE WHALE</text>'
    show(f"#{t1}", t_tough); show(f"#{t2}", s(a) + 1.0)
    out += "</svg>"
    return out


def beak_measure(a, b, t_scale, t_bigger):
    out = bg2d(a, b, "dark")
    pb = fitted("beak_measure", 800, 900)
    i = nid("cd")
    out += f'<div id="{i}" class="fcard" style="left:140px;top:150px;opacity:0"><img src="{pb}" alt="measuring a squid beak" style="width:560px;height:700px;object-fit:cover"><div class="fcap">MEASURE THE BEAK</div></div>'
    show(f"#{i}", s(a) + 0.2, 0.6, 30)
    p, w, h = cutout("colossal_side")
    sw = 760; sh = int(h * sw / w)
    sq = nid("sq")
    out += f'<img id="{sq}" src="{p}" alt="colossal squid" style="position:absolute;left:1000px;top:{540 - sh // 2}px;width:{sw}px;height:{sh}px;opacity:0;transform-origin:50% 50%">'
    tw(f"#{sq}", {"opacity": 1, "scale": 1}, t_scale, 0.9, {"opacity": 0, "scale": 0.4}, "power2.out")
    out += SVG0
    ar = nid("ar")
    out += f'<path id="{ar}" d="M740,540 L960,540" stroke="#fff" stroke-width="8" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" marker-end="url(#am)" opacity="0"/><defs><marker id="am" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#fff"/></marker></defs>'
    draw(f"#{ar}", s(t_scale) - 0.4, 0.5)
    tw(f"#{ar}", {"opacity": 1}, s(t_scale) - 0.4, 0.1, {"opacity": 0})
    dsh = nid("ds")
    out += f'<rect id="{dsh}" x="900" y="{540 - sh * 0.75:.0f}" width="{sw * 1.35:.0f}" height="{sh * 1.5:.0f}" fill="none" stroke="#e0322b" stroke-width="4" stroke-dasharray="16 12" opacity="0"/>'
    show(f"#{dsh}", t_bigger, 0.6, 0)
    t1 = nid("tx")
    out += f'<text id="{t1}" x="1380" y="{540 + sh * 0.75 + 70:.0f}" text-anchor="middle" {TXT} font-size="64" fill="#ff8a7a" opacity="0">BIGGER THAN ANY EVER CAUGHT</text></svg>'
    show(f"#{t1}", s(t_bigger) + 0.4)
    tw(f"#{sq}", {"scale": 1.3}, t_bigger, 2.0, None, "power2.inOut")
    out += credit("Beak photo: Wikimedia Commons, public domain")
    return out


# ---------------- sperm whale sonar ----------------
def sonar(a, b, t_loud, t_sonar):
    out = bg2d(a, b, "dark") + SVG0
    out += sperm_svg(80, 520, 620, "#26323a", 1.0)
    clicks = int((s(b) - s(a) - 1) / 0.7)
    for k in range(clicks):
        rid = nid("ck")
        t = s(a) + 0.6 + k * 0.7
        out += f'<path id="{rid}" d="M720,380 A180,180 0 0,1 720,660" fill="none" stroke="#7fe0ff" stroke-width="6" opacity="0"/>'
        tw(f"#{rid}", {"x": 1000, "opacity": 0}, t, 1.8, {"x": 0, "opacity": 0.9}, "none")
        sfx("sonar_click", t, 0.0)
    p, w, h = cutout("colossal_side")
    sw = 260; sh = int(h * sw / w)
    out += f'<image href="{p}" x="1560" y="{520 - sh / 2:.0f}" width="{sw}" height="{sh}" opacity=".55"/>'
    for k in range(max(0, clicks - 3)):
        eid = nid("ec")
        t = s(t_sonar) + 0.4 + k * 0.7
        if t > s(b) - 1.5: break
        out += f'<path id="{eid}" d="M1540,440 A110,110 0 0,0 1540,600" fill="none" stroke="#f0a64a" stroke-width="5" opacity="0"/>'
        tw(f"#{eid}", {"x": -700, "opacity": 0}, t, 1.4, {"x": 0, "opacity": 0.9}, "none")
    l1 = nid("tx")
    out += f'<text id="{l1}" x="960" y="200" text-anchor="middle" {TXT} font-size="90" opacity="0">ONE OF THE LOUDEST ANIMALS ON EARTH</text>'
    show(f"#{l1}", t_loud)
    l2 = nid("tx")
    out += f'<text id="{l2}" x="960" y="900" text-anchor="middle" {TXT} font-size="80" fill="#f0a64a" opacity="0">CLICK, LISTEN FOR THE ECHO</text>'
    show(f"#{l2}", t_sonar)
    out += "</svg>"
    return out


# ---------------- what we still don't know ----------------
def unknowns(a, b, times):
    items = ["HOW BIG CAN THEY GET?", "HOW LONG DO THEY LIVE?", "HOW DO THEY FIND A MATE?", "HOW MANY ARE THERE?"]
    out = dim(0.55)
    for k, (txt, t) in enumerate(zip(items, times)):
        i = nid("uk")
        out += f'<div id="{i}" class="recap" style="top:{180 + k * 180}px;opacity:0">{txt}</div>'
        show(f"#{i}", t, 0.5, 30)
    return out


# ---------------- Mars vs squid ----------------
def mars(a, b, t_zero):
    out = bg2d(a, b, "dark")
    tiles = ""
    k = 0
    for name in ("mars1", "mars2"):
        for j in range(6):
            p = fitted(name, 600, 400, (j / 6, 0.1, (j + 1) / 6, 0.9))
            x, y = 70 + (k % 4) * 215, 160 + (k // 4) * 250
            tid = nid("mt")
            tiles += f'<img id="{tid}" src="{p}" alt="Mars" style="position:absolute;left:{x}px;top:{y}px;width:205px;height:240px;object-fit:cover;opacity:0">'
            tw(f"#{tid}", {"opacity": 1}, s(a) + 0.1 + k * 0.07, 0.3, {"opacity": 0})
            k += 1
    out += tiles
    out += '<div class="bigsub" style="left:70px;width:860px;top:80px;text-align:left">SURFACE OF MARS</div>'
    z = nid("c")
    out += f'<div style="position:absolute;left:1040px;top:160px;width:800px;height:740px;border:4px dashed #5b7486;border-radius:12px"></div>'
    out += f'<div class="bigsub" style="left:1040px;width:800px;top:80px">A LIVING ADULT COLOSSAL SQUID</div>'
    out += f'<div id="{z}" class="big" style="left:1040px;width:800px;top:360px;font-size:300px;opacity:0">0</div>'
    pop(f"#{z}", t_zero, 0.6)
    out += credit("Mars: NASA/JPL-Caltech/MSSS · public domain")
    return out


# ---------------- end card ----------------
def endcard(a, b, t_sub):
    t1 = nid("tx"); bt = nid("bt")
    out = dim(0.6) + f'<div id="{t1}" class="chap" style="top:330px;font-size:200px;opacity:0">UNSEEN KINGDOM</div>'
    tw(f"#{t1}", {"opacity": 1, "scale": 1}, s(a) + 0.5, 1.2, {"opacity": 0, "scale": 1.05})
    out += f'<div id="{bt}" class="subbtn" style="opacity:0">SUBSCRIBE</div>'
    pop(f"#{bt}", t_sub, 0.6)
    out += fade_out_black(s(b) - 2.2, 2.0)
    return out
