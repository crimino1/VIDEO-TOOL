"""2D graphics (SVG + GSAP) for the sperm whale film. Each returns the inner HTML of a full-screen layer."""
import math
from lib import *

SVG0 = '<svg class="full" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">'
TXT = 'font-family="League Gothic" fill="#f2f6f8"'
SUB = 'font-family="Inter" font-weight="700" fill="#c9d6dc"'


def show(sel, t, d=0.5, y=20):
    tw(sel, {"opacity": 1, "y": 0}, t, d, {"opacity": 0, "y": y}, "power2.out")


def pop(sel, t, d=0.5, scale=0.85):
    tw(sel, {"opacity": 1, "scale": 1}, t, d, {"opacity": 0, "scale": scale}, "back.out(1.6)")


def draw(sel, t, d=1.0):
    tw(sel, {"strokeDashoffset": 0}, t, d, {"strokeDashoffset": 1}, "power1.inOut")


def counter(eid, t, d, v0, v1, suffix=""):
    add_tl(f'tl.to({{v:{v0}}},{{v:{v1},duration:{d:.3f},ease:"power2.out",onUpdate:function(){{var e=document.getElementById("{eid}");if(e)e.textContent=Math.round(this.targets()[0].v).toLocaleString("en-US")+"{suffix}"}}}},{T(t)});')


def cut_img(name, x, y, w, extra="", flip=False):
    p, iw, ih = cutout(name)
    h = int(ih * w / iw)
    tr = "transform:scaleX(-1);" if flip else ""
    return f'<img src="{p}" alt="{name}" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;{tr}{extra}">', h


# ---------------- recap tiles: words appearing one by one ----------------
def tiles(a, b, items, times, top=170, size=110):
    out = bg2d(a, b, "dark")
    gap = min(190, (1080 - 2 * top) / max(1, len(items) - 1)) if len(items) > 1 else 0
    for k, (txt, t) in enumerate(zip(items, times)):
        i = nid("rc")
        out += f'<div id="{i}" class="recap" style="top:{top + k * gap:.0f}px;font-size:{size}px;opacity:0">{txt}</div>'
        show(f"#{i}", t, 0.5, 30)
    return out


# ---------------- step card for "rewrite evolution" ----------------
def step(a, b, num, text, t_text=None):
    out = dim(0.45)
    n, tx = nid("st"), nid("st")
    out += f'<div id="{n}" class="stepnum" style="opacity:0">STEP {num}</div><div id="{tx}" class="steptxt" style="opacity:0">{text}</div>'
    pop(f"#{n}", s(a) + 0.15, 0.5); show(f"#{tx}", s(t_text or s(a) + 0.8), 0.5)
    tw(f"#{n}", {"opacity": 0}, s(b) - 0.5, 0.4); tw(f"#{tx}", {"opacity": 0}, s(b) - 0.5, 0.4)
    return out


# ---------------- sperm whale to scale: bus and person ----------------
BUS = "M0,0 L0,-260 Q0,-290 30,-290 L1080,-290 Q1120,-290 1130,-250 L1150,-120 L1150,0 Z"


def size_bus(a, b, t_bus, t_tons):
    ppm = 100                      # px per metre: 16 m whale = 1600 px
    out = bg2d(a, b, "ocean")
    img, h = cut_img("il_sperm", 160, 330, 1600)
    wid = nid("wh")
    out += f'<div id="{wid}" style="opacity:0">{img}</div>'
    tw(f"#{wid}", {"opacity": 1, "x": 0}, s(a) + 0.2, 1.0, {"opacity": 0, "x": 60})
    out += SVG0
    bid = nid("bus")
    out += (f'<g id="{bid}" opacity="0"><g transform="translate(160 980) scale({12 * ppm / 1150:.4f})"><path d="{BUS}" fill="#d8a43a" opacity=".9"/>'
            f'<rect x="60" y="-240" width="980" height="110" fill="#1d2a33" opacity=".7"/><circle cx="220" cy="0" r="55" fill="#111"/><circle cx="920" cy="0" r="55" fill="#111"/></g>'
            f'<text x="760" y="1040" text-anchor="middle" {SUB} font-size="34">CITY BUS · 12 M</text></g>')
    show(f"#{bid}", t_bus)
    out += human(1830, 980, 1.8 * ppm)
    ln = nid("ln")
    out += f'<line id="{ln}" x1="160" y1="290" x2="1760" y2="290" stroke="#f2f6f8" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    draw(f"#{ln}", s(a) + 0.8, 1.2)
    t1, t2 = nid("tx"), nid("tx")
    out += f'<text id="{t1}" x="960" y="250" text-anchor="middle" {TXT} font-size="110" opacity="0">AROUND 16 METRES</text>'
    out += f'<text id="{t2}" x="960" y="170" text-anchor="middle" {TXT} font-size="90" fill="#ffd27a" opacity="0">40+ TONNES</text>'
    show(f"#{t1}", s(a) + 1.4); show(f"#{t2}", t_tons)
    out += "</svg>"
    return out


# ---------------- head = a third of the body ----------------
def head_third(a, b):
    out = bg2d(a, b, "ocean")
    img, h = cut_img("il_sperm", 160, 400, 1600)
    out += img + SVG0
    br = nid("br")
    x0 = 160 + 1600 * 0.66
    out += f'<g id="{br}" opacity="0"><rect x="{x0:.0f}" y="380" width="{1600 * 0.34:.0f}" height="{h + 40}" fill="none" stroke="#ffd27a" stroke-width="6" stroke-dasharray="18 12" rx="16"/>'
    out += f'<text x="{x0 + 270:.0f}" y="350" text-anchor="middle" {TXT} font-size="80" fill="#ffd27a">THE HEAD: ABOUT A THIRD</text></g>'
    show(f"#{br}", s(a) + 0.6)
    out += "</svg>"
    return out


# ---------------- brain: 8 kg vs 1.3 kg ----------------
BRAIN = ("M-100,10 C-112,-40 -70,-92 -10,-96 C40,-100 92,-76 106,-36 C118,-6 110,24 86,34 C76,54 52,62 30,55 C20,70 2,72 -10,60 "
         "L-14,88 L-30,88 L-28,56 C-62,60 -96,44 -100,10 Z")
GYRI = ["M-80,-10 C-60,-30 -40,0 -20,-20 S20,-10 40,-30", "M-70,15 C-50,-5 -30,25 -5,5 S35,20 60,0", "M-50,-55 C-30,-70 -10,-45 10,-65 S50,-55 70,-60",
        "M-90,-30 C-80,-55 -55,-60 -40,-75", "M20,-80 C40,-70 60,-75 80,-50", "M-40,40 C-20,30 0,45 20,35"]


def brain_svg(cx, cy, scale, gid):
    g = (f'<defs><radialGradient id="{gid}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#f6c4bd"/><stop offset=".6" stop-color="#e0948c"/><stop offset="1" stop-color="#a95f5a"/></radialGradient></defs>'
         f'<g transform="translate({cx} {cy}) scale({scale})"><path d="{BRAIN}" fill="url(#{gid})" stroke="#7a3d3a" stroke-width="{2.5 / scale * 1.5:.2f}"/>')
    g += "".join(f'<path d="{d}" fill="none" stroke="#9c524e" stroke-width="{3 / scale * 1.4:.2f}" stroke-linecap="round" opacity=".7"/>' for d in GYRI)
    return g + '<path d="M60,40 C75,52 90,40 92,28" fill="none" stroke="#9c524e" stroke-width="4" opacity=".7"/></g>'


def brain(a, b, t_human):
    out = bg2d(a, b, "dark") + SVG0
    g1, g2 = nid("g"), nid("g")
    out += f'<g id="{g1}" opacity="0">{brain_svg(680, 520, 2.4, nid("bg"))}<text x="680" y="880" text-anchor="middle" {TXT} font-size="90">SPERM WHALE · ~8 KG</text></g>'
    out += f'<g id="{g2}" opacity="0">{brain_svg(1460, 620, 0.97, nid("bg"))}<text x="1460" y="880" text-anchor="middle" {TXT} font-size="90">YOU · ~1.3 KG</text></g>'
    pop(f"#{g1}", s(a) + 0.3, 0.7); pop(f"#{g2}", t_human, 0.6)
    t = nid("tx")
    out += f'<text id="{t}" x="960" y="160" text-anchor="middle" {TXT} font-size="96" opacity="0">THE BIGGEST BRAIN OF ANY ANIMAL, EVER</text>'
    show(f"#{t}", s(a) + 0.8)
    out += "</svg>"
    return out


# ---------------- inside the head: spermaceti organ and the sound beam ----------------
def head_inside(a, b, t_oil, t_beam=None):
    out = bg2d(a, b, "dark")
    img, h = cut_img("il_sperm", -900, 300, 2700, "opacity:.55")
    out += img + SVG0
    # head occupies the right part of the frame; the organ sits along the top of the forehead
    org = nid("og")
    out += f'<g id="{org}" opacity="0"><ellipse cx="1350" cy="470" rx="380" ry="95" fill="#f0c95a" opacity=".85"/><text x="1350" y="345" text-anchor="middle" {TXT} font-size="76" fill="#ffd27a">SPERMACETI ORGAN</text></g>'
    show(f"#{org}", s(a) + 0.4)
    junk = nid("jk")
    out += f'<g id="{junk}" opacity="0"><ellipse cx="1360" cy="640" rx="330" ry="80" fill="#e0e6d0" opacity=".45"/><text x="1360" y="660" text-anchor="middle" {SUB} font-size="34" fill="#1a2328">"JUNK" (SOUND LENSES)</text></g>'
    show(f"#{junk}", s(a) + 1.4)
    oil = nid("tx")
    out += f'<text id="{oil}" x="1350" y="910" text-anchor="middle" {TXT} font-size="84" opacity="0">WAXY OIL · WELL OVER 1,000 LITRES</text>'
    show(f"#{oil}", t_oil)
    if t_beam:
        for k in range(8):
            bid = nid("bm")
            out += f'<path id="{bid}" d="M1740,600 A120,160 0 0,1 1740,700" fill="none" stroke="#7fe0ff" stroke-width="7" opacity="0"/>'
            tw(f"#{bid}", {"x": 380, "opacity": 0}, s(t_beam) + k * 0.5, 1.0, {"x": 0, "opacity": 1}, "none")
    out += "</svg>"
    return out


# ---------------- codas: click patterns lighting up ----------------
def codas(a, b, click_times, t_conv):
    out = bg2d(a, b, "dark") + SVG0
    t0 = s(a)
    out += f'<line x1="200" y1="540" x2="1720" y2="540" stroke="#2c3e4a" stroke-width="4"/>'
    for k, ct in enumerate(click_times):
        x = 300 + (s(ct) - s(click_times[0])) * 380
        cid = nid("ck")
        out += f'<g id="{cid}" opacity="0.15"><line x1="{x:.0f}" y1="400" x2="{x:.0f}" y2="680" stroke="#7fe0ff" stroke-width="16" stroke-linecap="round"/></g>'
        tw(f"#{cid}", {"opacity": 1}, ct, 0.05, {"opacity": 0.15}, "none")
        tw(f"#{cid}", {"opacity": 0.5}, s(ct) + 0.25, 0.4)
        sfx("coda_click", ct, 1.0)
    t1 = nid("tx")
    out += f'<text id="{t1}" x="960" y="220" text-anchor="middle" {TXT} font-size="120" opacity="0">CODAS</text>'
    show(f"#{t1}", t0 + 0.3)
    t2 = nid("tx")
    out += f'<text id="{t2}" x="960" y="880" text-anchor="middle" {SUB} font-size="44" opacity="0">PATTERNED BURSTS OF CLICKS, TRADED BACK AND FORTH</text>'
    show(f"#{t2}", t_conv)
    out += "</svg>"
    return out


# ---------------- dialects: two clans, two rhythms ----------------
def dialects(a, b):
    out = bg2d(a, b, "dark") + SVG0
    for side, (x, col, rhythm, name) in enumerate(((520, "#7fe0ff", [0, 0.25, 0.5, 0.75, 1.0], "CLAN A"), (1400, "#f0a64a", [0, 0.2, 0.4, 0.9, 1.1], "CLAN B"))):
        out += sperm_svg(x - 250, 470, 500, "#2a353d")
        out += f'<text x="{x}" y="300" text-anchor="middle" {TXT} font-size="80" fill="{col}">{name}</text>'
        for rep in range(int((s(b) - s(a)) / 2.0)):
            for k, r_ in enumerate(rhythm):
                did = nid("dd")
                t = s(a) + 0.6 + rep * 2.0 + r_ + side * 0.15
                out += f'<circle id="{did}" cx="{x - 160 + k * 80}" cy="720" r="22" fill="{col}" opacity="0.15"/>'
                tw(f"#{did}", {"opacity": 1}, t, 0.05, None, "none"); tw(f"#{did}", {"opacity": 0.15}, t + 0.25, 0.3)
    t = nid("tx")
    out += f'<text id="{t}" x="960" y="940" text-anchor="middle" {TXT} font-size="90" opacity="0">SAME WATERS, DIFFERENT DIALECTS</text>'
    show(f"#{t}", s(a) + 1.0)
    out += "</svg>"
    return out


# ---------------- the 2024 "phonetic alphabet" features ----------------
def alphabet(a, b, times):
    names = ["RHYTHM", "TEMPO", "RUBATO", "ORNAMENTATION"]
    subs = ["THE PATTERN OF GAPS", "HOW FAST THE CODA RUNS", "SMOOTH STRETCHING OF TIMING", "AN EXTRA CLICK ADDED"]
    out = bg2d(a, b, "dark")
    for k, (n, sb, t) in enumerate(zip(names, subs, times)):
        i = nid("ab")
        x = 120 + k * 430
        out += f'<div id="{i}" class="acard" style="left:{x}px;opacity:0"><div class="an">{n}</div><div class="as">{sb}</div></div>'
        show(f"#{i}", t, 0.5, 40)
    t2 = nid("tx")
    out += f'<div id="{t2}" class="bigsub" style="top:820px;opacity:0">COMBINED IN STRUCTURED WAYS · "A KIND OF PHONETIC ALPHABET"</div>'
    show(f"#{t2}", s(times[-1]) + 1.5)
    out += credit("Sharma et al. 2024, Nature Communications · Project CETI")
    return out


# ---------------- orcas go quiet ----------------
def silence(a, b, t_quiet):
    out = bg2d(a, b, "dark") + SVG0
    wid = nid("wv")
    pts = " ".join(f"{600 + i * 10},{540 + 120 * math.sin(i * 0.5) * math.exp(-((i - 60) / 45) ** 2)}" for i in range(121))
    out += f'<polyline id="{wid}" points="{pts}" fill="none" stroke="#7fe0ff" stroke-width="6" style="transform-origin:1200px 540px"/>'
    tw(f"#{wid}", {"scaleY": 0.02}, t_quiet, 1.2, {"scaleY": 1}, "power2.inOut")
    t = nid("tx")
    out += f'<text id="{t}" x="1200" y="300" text-anchor="middle" {TXT} font-size="120" opacity="0">THEY GO QUIET</text>'
    show(f"#{t}", s(t_quiet) + 0.3)
    out += "</svg>"
    return out


# ---------------- orca diets ----------------
def diets(a, b, times):
    items = [("ONLY FISH", "px_fish"), ("ONLY SHARKS", "px_shark"), ("ONLY MAMMALS", "px_seal")]
    out = bg2d(a, b, "dark")
    h0 = nid("tx")
    out += f'<div id="{h0}" class="bigsub" style="top:150px;font-size:80px;opacity:0">DIFFERENT GROUPS · DIFFERENT PREY · DIFFERENT TECHNIQUES</div>'
    show(f"#{h0}", s(a) + 0.2)
    for k, ((txt, _), t) in enumerate(zip(items, times)):
        i = nid("dc")
        out += f'<div id="{i}" class="acard" style="left:{180 + k * 560}px;width:480px;opacity:0"><div class="an">{txt}</div><div class="as">A DIFFERENT ORCA GROUP</div></div>'
        show(f"#{i}", t, 0.5, 40)
    return out


# ---------------- squid: what the deep feeds them ----------------
def squid_tons(a, b, t_ton):
    out = bg2d(a, b, "dark")
    img, h = cut_img("squid_3d", 120, 300, 900)
    out += img
    t1, t2 = nid("tx"), nid("tx")
    out += f'<div id="{t1}" class="big" style="left:1000px;right:60px;top:250px;font-size:150px;opacity:0;text-align:left">TENS OF MILLIONS OF TONNES</div>'
    out += f'<div id="{t2}" class="bigsub" style="left:1000px;right:60px;top:600px;opacity:0;text-align:left">OF SQUID EATEN EVERY YEAR (ESTIMATE) · A BIG MALE: CLOSE TO A TONNE A DAY</div>'
    show(f"#{t1}", s(a) + 0.5); show(f"#{t2}", t_ton)
    return out


# ---------------- food web knock-on ----------------
def foodweb(a, b, times):
    names = [("SPERM WHALES LEAVE THE DEEP", "#f2f6f8"), ("SQUID MIGHT BOOM ↑", "#8fe39a"), ("FISH THEY EAT ↓", "#ff8a7a"), ("PREDATORS OF THE DEEP ↕", "#ffd27a")]
    out = bg2d(a, b, "dark")
    for k, ((n, c), t) in enumerate(zip(names, times)):
        i = nid("fw")
        out += f'<div id="{i}" class="recap" style="top:{150 + k * 200}px;font-size:96px;color:{c};opacity:0">{n}</div>'
        show(f"#{i}", t, 0.5, 30)
    return out


# ---------------- side-by-side kings ----------------
def endcard(a, b, t_sub):
    t1, bt = nid("tx"), nid("bt")
    out = dim(0.5) + f'<div id="{t1}" class="chap" style="top:330px;font-size:200px;opacity:0">UNSEEN KINGDOM</div>'
    tw(f"#{t1}", {"opacity": 1, "scale": 1}, s(a) + 0.5, 1.2, {"opacity": 0, "scale": 1.05})
    out += f'<div id="{bt}" class="subbtn" style="opacity:0">SUBSCRIBE</div>'
    pop(f"#{bt}", t_sub, 0.6)
    out += fade_out_black(s(b) - 2.2, 2.0)
    return out
