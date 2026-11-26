"""Graphics for the Mariana Trench film (SVG + GSAP). Each returns the inner HTML of a full-screen layer."""
import json, math
from lib import *
from scenes2d import SVG0, TXT, SUB, show, pop, draw, counter, tiles, cut_img

MAP = json.load(open(H / "assets" / "map_pacific.json"))
ZONES = [("SUNLIGHT", 0, 200, "#3f9fc4"), ("TWILIGHT", 200, 1000, "#1d5f7e"), ("MIDNIGHT", 1000, 4000, "#0b2433"), ("ABYSS", 4000, 6000, "#06141d"), ("HADAL", 6000, 11000, "#020709")]


def depth_hud(a, b, keys):
    """Depth gauge on the right: zone bands, a marker and a counter. keys = [(time, metres), ...]."""
    top, bot = 230, 1000
    y = lambda m: top + (bot - top) * (m / 11000) ** 0.55          # stretched so the shallow zones are readable
    out = '<svg class="full" viewBox="0 0 1920 1080">'
    for name, m0, m1, col in ZONES:
        out += f'<rect x="1790" y="{y(m0):.0f}" width="34" height="{y(m1) - y(m0):.0f}" fill="{col}" stroke="rgba(255,255,255,.25)" stroke-width="1"/>'
        out += f'<text x="1776" y="{(y(m0) + y(m1)) / 2 + 9:.0f}" text-anchor="end" font-family="League Gothic" font-size="30" fill="rgba(235,245,250,.75)">{name}</text>'
    mk = nid("mk"); c = nid("c")
    out += f'<g id="{mk}"><polygon points="1830,0 1856,-14 1856,14" fill="#ffd27a" transform="translate(0 {y(keys[0][1]):.0f})"/></g></svg>'
    out += f'<div id="{c}" class="dv" style="position:absolute;right:120px;top:40px;opacity:1">{keys[0][1]:,} M</div>'
    for (t0, m0), (t1, m1) in zip(keys, keys[1:]):
        tw(f"#{mk}", {"y": y(m1) - y(keys[0][1])}, t0, s(t1) - s(t0), None, "power1.inOut")
        add_tl(f'tl.to({{v:{m0}}},{{v:{m1},duration:{s(t1) - s(t0):.3f},ease:"power1.inOut",onUpdate:function(){{var e=document.getElementById("{c}");if(e)e.textContent=Math.round(this.targets()[0].v/10)*10+" M"}}}},{T(t0)});')
    return out


def pacific_map(a, b, t_deep):
    m = MAP["wide"]
    out = bg2d(a, b, "dark") + SVG0 + '<defs><radialGradient id="pac" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#1b5a7a"/><stop offset="1" stop-color="#06202e"/></radialGradient></defs>'
    g = nid("mp")
    out += f'<g id="{g}"><rect x="-2000" y="-2000" width="6000" height="5000" fill="url(#pac)"/><path d="{m["land"]}" fill="#c9d6dc" stroke="#fff" stroke-width="1"/>'
    pts = " ".join(f"{x:.0f},{y:.0f}" for x, y in m["trench"])
    tid = nid("tr")
    out += f'<polyline id="{tid}" points="{pts}" fill="none" stroke="#e0322b" stroke-width="5" stroke-dasharray="14 10" opacity="0"/></g>'
    gx, gy = m["guam"]; dx, dy = m["deep"]
    out += f'<g id="{g}g" opacity="0"><circle cx="{gx:.0f}" cy="{gy:.0f}" r="10" fill="#fff"/><text x="{gx + 20:.0f}" y="{gy + 10:.0f}" {TXT} font-size="52">GUAM</text></g>'
    out += f'<g id="{g}d" opacity="0"><circle cx="{dx:.0f}" cy="{dy:.0f}" r="14" fill="#e0322b"/><circle cx="{dx:.0f}" cy="{dy:.0f}" r="34" fill="none" stroke="#e0322b" stroke-width="4"/>'
    out += f'<text x="{dx - 30:.0f}" y="{dy + 80:.0f}" text-anchor="middle" {TXT} font-size="56">YOU ARE HERE</text></g></svg>'
    out += f'<div id="{g}t" class="bigsub" style="top:110px;opacity:0">ABOUT 300 KM SOUTHWEST OF GUAM</div>'
    tw(f"#{g}", {"scale": 1.6, "svgOrigin": f"{dx:.0f} {dy:.0f}"}, a, s(b) - s(a), {"scale": 1.0, "svgOrigin": f"{dx:.0f} {dy:.0f}"}, "sine.inOut")
    show(f"#{g}g", s(a) + 0.3); pop(f"#{g}d", t_deep, 0.6); show(f"#{g}t", s(t_deep) + 0.4)
    tw(f"#{tid}", {"opacity": 0.9}, s(a) + 0.8, 0.8, {"opacity": 0})
    return out


EVEREST = "M0,0 L180,-420 L230,-380 L330,-620 L380,-560 L470,-860 L520,-800 L600,-690 L690,-540 L780,-470 L900,-280 L1000,-160 L1100,0 Z"


def trench_section(a, b, t_title=None, t_everest=None, t_peak=None):
    """Cross-section: sea surface, a 4 km plain, the trench to 11 km. Everest drops in and its peak stays 2 km under."""
    ppk = 78.0; s0 = 130
    yk = lambda km: s0 + km * ppk
    out = bg2d(a, b, "dark") + SVG0
    out += f'<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a86ad"/><stop offset=".15" stop-color="#0f3a52"/><stop offset=".5" stop-color="#041520"/><stop offset="1" stop-color="#010407"/></linearGradient></defs>'
    out += f'<rect x="0" y="{s0}" width="1920" height="{1080 - s0}" fill="url(#sea)"/><path d="M0,{s0} q60,-10 120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0 t120,0" fill="none" stroke="#bfe6f5" stroke-width="3"/>'
    floor = f"M0,{yk(4):.0f} L560,{yk(4.3):.0f} L820,{yk(7):.0f} L960,{yk(10.9):.0f} L1060,{yk(8):.0f} L1300,{yk(4.6):.0f} L1920,{yk(4.2):.0f} L1920,1080 L0,1080 Z"
    out += f'<path d="{floor}" fill="#2b2420" stroke="#6d5a4a" stroke-width="3"/>'
    for km in (0, 2, 4, 6, 8, 10):
        out += f'<line x1="40" y1="{yk(km):.0f}" x2="70" y2="{yk(km):.0f}" stroke="#9fb4c0" stroke-width="3"/><text x="82" y="{yk(km) + 11:.0f}" font-family="Inter" font-weight="700" font-size="30" fill="#9fb4c0">{km} km</text>'
    dp = nid("dp")
    out += f'<g id="{dp}" opacity="0"><circle cx="960" cy="{yk(10.9):.0f}" r="12" fill="#e0322b"/><text x="1000" y="{yk(10.9) + 10:.0f}" {TXT} font-size="56">CHALLENGER DEEP · ~11 KM</text></g>'
    show(f"#{dp}", t_title or s(a) + 0.5)
    if t_everest:
        ev = nid("ev"); k = 8.85 * ppk / 860
        out += (f'<g id="{ev}" opacity="0"><g transform="translate({960 - 1100 * k / 2:.0f} {yk(10.9):.0f}) scale({k:.4f})"><path d="{EVEREST}" fill="#c9d6dc" opacity=".9"/>'
                f'<path d="M470,-860 L520,-800 L560,-740 L500,-760 L450,-700 L420,-760 Z" fill="#fff"/></g></g>')
        tw(f"#{ev}", {"opacity": 1, "y": 0}, t_everest, 1.8, {"opacity": 0, "y": -500}, "power2.out")
        lb = nid("tx")
        out += f'<text id="{lb}" x="1180" y="{yk(3.0):.0f}" {TXT} font-size="64" opacity="0">MOUNT EVEREST · 8.8 KM</text>'
        show(f"#{lb}", s(t_everest) + 1.2)
        pk = nid("pk")
        out += f'<g id="{pk}" opacity="0"><line x1="960" y1="{s0}" x2="960" y2="{yk(2.05):.0f}" stroke="#ffd27a" stroke-width="5" stroke-dasharray="10 8"/><text x="990" y="{yk(1.2):.0f}" {TXT} font-size="60" fill="#ffd27a">PEAK STILL 2 KM UNDERWATER</text></g>'
        show(f"#{pk}", t_peak or s(t_everest) + 3)
    out += "</svg>"
    return out


def moon_vs(a, b, t_deep):
    out = bg2d(a, b, "dark")
    pm = fitted("moon", 900, 900, (0.1, 0.05, 0.9, 0.75))
    i1, i2 = nid("cd"), nid("cd")
    out += f'<div id="{i1}" class="fcard" style="left:150px;top:170px;opacity:0"><img src="{pm}" alt="moon walk" style="width:700px;height:560px;object-fit:cover"><div class="fcap">THE MOON · 12 PEOPLE HAVE STOOD THERE</div></div>'
    out += (f'<div id="{i2}" class="fcard" style="left:1070px;top:170px;opacity:0;width:700px"><div style="height:560px;background:#020709;display:flex;align-items:center;justify-content:center">'
            f'<div style="font-family:League Gothic;font-size:260px;color:#fff">3</div></div><div class="fcap">CHALLENGER DEEP · PEOPLE WHO REACHED IT UNTIL 2019</div></div>')
    show(f"#{i1}", s(a) + 0.3, 0.6, 40); show(f"#{i2}", t_deep, 0.6, 40)
    out += credit("Apollo 11, NASA · public domain")
    return out


def lungs(a, b, t10, t30):
    img, hh = cut_img("diver_surface", 700, 60, 520)
    out = bg2d(a, b, "dark") + img + SVG0
    lg = nid("lg")
    out += (f'<g id="{lg}" opacity=".7"><path d="M950,330 Q885,340 882,410 Q886,482 950,474 Z" fill="#ff8a7a"/><path d="M970,330 Q1035,340 1038,410 Q1034,482 970,474 Z" fill="#ff8a7a"/></g>')
    tw(f"#{lg}", {"scaleX": 0.72, "scaleY": 0.72, "svgOrigin": "960 400"}, t10, 1.2, {"scaleX": 1, "scaleY": 1, "svgOrigin": "960 400"}, "power2.inOut")
    tw(f"#{lg}", {"scaleX": 0.52, "scaleY": 0.52, "svgOrigin": "960 400"}, t30, 1.2, None, "power2.inOut")
    labels = [("SURFACE · 100%", s(a) + 0.4), ("10 M · AIR SQUEEZED TO HALF", t10), ("30 M · A QUARTER", t30)]
    for k, (txt, t) in enumerate(labels):
        i = nid("tx")
        out += f'<text id="{i}" x="1180" y="{360 + k * 110}" {TXT} font-size="66" opacity="0">{txt}</text>'
        show(f"#{i}", t)
        if k < 2: tw(f"#{i}", {"opacity": 0.35}, labels[k + 1][1], 0.4)
    out += "</svg>"
    return out


def body_water(a, b, t_air, times):
    img, hh = cut_img("diver_surface", 700, 60, 520)
    out = bg2d(a, b, "dark") + img + SVG0
    t1 = nid("tx")
    out += f'<text id="{t1}" x="120" y="260" {TXT} font-size="80" opacity="0">YOU’RE MOSTLY WATER</text>'
    show(f"#{t1}", s(a) + 0.3)
    t2 = nid("tx")
    out += f'<text id="{t2}" x="120" y="330" {SUB} font-size="36" opacity="0">AND WATER BARELY COMPRESSES</text>'
    show(f"#{t2}", s(a) + 1.4)
    spots = [("LUNGS", 960, 405, 70), ("SINUSES", 962, 150, 18), ("EARS", 1030, 150, 14)]
    for (name, x, y, r), t in zip(spots, times):
        i = nid("sp")
        out += f'<g id="{i}" opacity="0"><circle cx="{x}" cy="{y}" r="{r}" fill="#ffd27a" opacity=".85"/><line x1="{x + r}" y1="{y}" x2="1300" y2="{y}" stroke="#ffd27a" stroke-width="3"/><text x="1320" y="{y + 18}" {TXT} font-size="60" fill="#ffd27a">{name}</text></g>'
        pop(f"#{i}", t, 0.5)
    t3 = nid("tx")
    out += f'<text id="{t3}" x="300" y="1010" {TXT} font-size="64" opacity="0">WHAT GETS CRUSHED: THE AIR SPACES</text>'
    show(f"#{t3}", t_air)
    out += "</svg>"
    return out


def big_card(a, b, big, sub, t_sub=None, color="#fff"):
    out = dim(0.55)
    i, j = nid("c"), nid("tx")
    out += f'<div id="{i}" class="big" style="top:330px;color:{color};opacity:0">{big}</div><div id="{j}" class="bigsub" style="top:600px;opacity:0">{sub}</div>'
    pop(f"#{i}", s(a) + 0.2, 0.6, 1.2); show(f"#{j}", t_sub or s(a) + 0.9)
    return out


def subduction(a, b):
    out = bg2d(a, b, "dark") + SVG0
    out += '<rect x="0" y="200" width="1920" height="200" fill="#145a7a" opacity=".55"/>'
    out += '<path d="M0,400 L780,400 L960,640 L1920,420 L1920,1080 L0,1080 Z" fill="#3a2f28"/>'
    sl = nid("sl")
    out += f'<g id="{sl}"><path d="M0,410 L900,430 L1500,1080 L1100,1080 L700,560 L0,540 Z" fill="#5a4636" stroke="#8a6c52" stroke-width="4"/></g>'
    tw(f"#{sl}", {"x": 70, "y": 50}, a, s(b) - s(a), {"x": 0, "y": 0}, "none")
    for k in range(3):
        ar = nid("ar")
        out += f'<path id="{ar}" d="M{200 + k * 220},480 l120,10" stroke="#ffd27a" stroke-width="10" marker-end="url(#sa)" opacity="0"/>'
        show(f"#{ar}", s(a) + 1 + k * 0.4, 0.5, 0)
    out += '<defs><marker id="sa" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#ffd27a"/></marker></defs>'
    l1, l2, l3 = nid("tx"), nid("tx"), nid("tx")
    out += f'<text id="{l1}" x="180" y="640" {TXT} font-size="64" opacity="0">PACIFIC PLATE</text>'
    out += f'<text id="{l2}" x="1250" y="560" {TXT} font-size="64" opacity="0">MARIANA PLATE</text>'
    out += f'<text id="{l3}" x="960" y="170" text-anchor="middle" {TXT} font-size="80" opacity="0">ONE PLATE SLIDES UNDER ANOTHER</text>'
    show(f"#{l1}", s(a) + 1.2); show(f"#{l2}", s(a) + 1.8); show(f"#{l3}", s(a) + 0.4)
    out += "</svg>"
    return out


def fish_limit(a, b, t_line):
    out = bg2d(a, b, "dark") + SVG0
    top, bot = 140, 980
    y = lambda m: top + (bot - top) * m / 11000
    out += f'<rect x="700" y="{top}" width="520" height="{bot - top}" fill="#06141d" stroke="#2b4656" stroke-width="3"/>'
    for m in range(0, 11001, 2000):
        out += f'<text x="680" y="{y(m) + 10:.0f}" text-anchor="end" font-family="Inter" font-weight="700" font-size="30" fill="#9fb4c0">{m:,} m</text>'
    bd = nid("bd")
    out += f'<rect id="{bd}" x="700" y="{y(8200):.0f}" width="520" height="{y(8400) - y(8200):.0f}" fill="#e0322b" opacity="0"/>'
    tw(f"#{bd}", {"opacity": 0.7}, t_line, 0.6, {"opacity": 0})
    dot = nid("d")
    out += f'<g id="{dot}" opacity="0"><circle cx="960" cy="{y(8336):.0f}" r="14" fill="#ffd27a"/><text x="1250" y="{y(8336) - 20:.0f}" {TXT} font-size="54" fill="#ffd27a">DEEPEST FISH FILMED · 8,336 M</text></g>'
    pop(f"#{dot}", s(a) + 0.5)
    t1 = nid("tx")
    out += f'<text id="{t1}" x="1250" y="{y(9200):.0f}" {TXT} font-size="64" fill="#ff8a7a" opacity="0">NO FISH EVER FOUND BELOW</text>'
    show(f"#{t1}", s(t_line) + 0.4)
    out += "</svg>"
    return out


ELEPHANT = ("M0,0 C0,-60 30,-110 90,-120 C150,-130 230,-120 260,-80 C280,-100 320,-100 330,-60 C335,-30 325,10 310,40 L300,40 L305,0 C300,-20 290,-30 280,-30 "
            "L270,40 L240,40 L235,0 L110,0 L105,40 L75,40 L70,0 C40,0 20,10 10,40 L-10,40 Z")


def elephant(a, b, t_card):
    out = bg2d(a, b, "dark") + SVG0
    g = nid("g")
    out += (f'<g transform="translate(-200 -420) scale(1.6)"><g id="{g}" opacity="0"><rect x="560" y="760" width="60" height="60" fill="#e8c7b6" stroke="#fff" stroke-width="3"/>'
            f'<g id="{g}e"><path d="{ELEPHANT}" transform="translate(440 715) scale(.9)" fill="#c9d6dc"/></g></g></g>')
    tw(f"#{g}", {"opacity": 1}, s(a) + 0.2, 0.4, {"opacity": 0})
    tw(f"#{g}e", {"y": 0}, s(a) + 0.2, 0.8, {"y": -300}, "bounce.out")
    t1, t2 = nid("tx"), nid("tx")
    out += f'<text id="{t1}" x="1150" y="560" {TXT} font-size="110" opacity="0">~8 TONS</text>'
    out += f'<text id="{t2}" x="1150" y="650" {SUB} font-size="40" opacity="0">ON EVERY SQUARE INCH OF YOU</text>'
    show(f"#{t1}", s(a) + 0.6); show(f"#{t2}", t_card)
    out += "</svg>"
    return out


def endcard(a, b, t_sub):
    t1, bt = nid("tx"), nid("bt")
    out = dim(0.55) + f'<div id="{t1}" class="chap" style="top:330px;font-size:200px;opacity:0">UNSEEN BY EYE</div>'
    tw(f"#{t1}", {"opacity": 1, "scale": 1}, s(a) + 0.4, 1.2, {"opacity": 0, "scale": 1.05})
    out += f'<div id="{bt}" class="subbtn" style="opacity:0">SUBSCRIBE</div>'
    pop(f"#{bt}", t_sub, 0.6)
    out += fade_out_black(s(b) - 2.2, 2.0)
    return out
