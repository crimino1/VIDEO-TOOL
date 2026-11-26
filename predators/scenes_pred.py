"""Graphics for "Every Deep Sea Predator Explained" (SVG + HTML + GSAP). Each returns the inner HTML of a full-screen layer."""
import json
from lib import *
from scenes2d import SVG0, TXT, SUB, show, pop, counter

WORLD = json.load(open(H / "assets" / "map_world.json"))


def size_compare(a, b, items, t_items, scale_m, title=None, t_title=None, floor_y=880):
    """Animals as real cut-outs on a metre ruler, beside a real diver photo for scale.
    items = [(cut name, length in m, label, flip)], appearing at t_items; scale_m = metres across 1600 px."""
    ppm = 1600 / scale_m
    out = bg2d(a, b, "ocean") + SVG0
    out += f'<line x1="160" y1="{floor_y}" x2="1760" y2="{floor_y}" stroke="rgba(220,235,245,.7)" stroke-width="3"/>'
    step = 0.05 if scale_m <= 1 else 0.5 if scale_m <= 4 else 1 if scale_m <= 10 else 2 if scale_m <= 24 else 5
    n = int(round(scale_m / step))
    for k in range(n + 1):
        m = k * step; x = 160 + m * ppm
        big = (scale_m <= 1 and k % 2 == 0) or (scale_m > 1 and abs(m - round(m)) < 1e-6)
        out += f'<line x1="{x:.0f}" y1="{floor_y}" x2="{x:.0f}" y2="{floor_y + (26 if big else 14)}" stroke="rgba(220,235,245,.7)" stroke-width="3"/>'
        if big: out += f'<text x="{x:.0f}" y="{floor_y + 66}" text-anchor="middle" {SUB} font-size="30">{(f"{m:g} M" if scale_m > 1 else f"{round(m * 100)} CM")}</text>'
    out += "</svg>"
    x = 160
    for (name, L, lab, flip), t in zip(items, t_items):
        p, iw, ih = cutout(name)
        w = L * ppm; hgt = ih * w / iw
        i, j = nid("sz"), nid("sl")
        tr = "transform:scaleX(-1);" if flip else ""
        out += f'<img id="{i}" src="{p}" alt="{name}" style="position:absolute;left:{x:.0f}px;top:{floor_y - 14 - hgt:.0f}px;width:{w:.0f}px;height:{hgt:.0f}px;opacity:0;{tr}filter:drop-shadow(0 16px 30px rgba(0,0,0,.6))">'
        out += f'<div class="row" style="left:{x - 100:.0f}px;width:{w + 200:.0f}px;text-align:center;top:{max(30, floor_y - 100 - hgt):.0f}px"><span id="{j}" class="stamp" style="font-size:56px">{lab}</span></div>'
        show(f"#{i}", t, 0.6, 30); show(f"#{j}", s(t) + 0.3, 0.5, 15)
        x += w + 80
    if title:
        k = nid("st"); out += f'<div id="{k}" class="bigsub" style="top:120px;opacity:0;font-size:80px">{title}</div>'; show(f"#{k}", t_title or s(a) + 0.2)
    return out


def light_depth(a, b, t0):
    """Sunlight colours fading with depth: red goes first, blue reaches deepest."""
    out = bg2d(a, b, "dark") + SVG0
    top, bot = 220, 980
    y = lambda m: top + (bot - top) * m / 200
    out += f'<text x="960" y="120" text-anchor="middle" {TXT} font-size="80">HOW DEEP EACH COLOUR OF SUNLIGHT REACHES</text>'
    for m in (0, 50, 100, 150, 200):
        out += f'<line x1="300" y1="{y(m):.0f}" x2="1640" y2="{y(m):.0f}" stroke="rgba(255,255,255,.12)" stroke-width="2"/><text x="270" y="{y(m) + 11:.0f}" text-anchor="end" {SUB} font-size="32">{m} M</text>'
    bands = [("RED", "#e8321e", 15), ("ORANGE", "#f08a1c", 30), ("YELLOW", "#f2d22a", 50), ("GREEN", "#3fbf5a", 110), ("BLUE", "#2f7fe0", 200)]
    for k, (nm, col, reach) in enumerate(bands):
        x = 420 + k * 250; gid = nid("lg"); r = nid("lb")
        out += f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{col}"/><stop offset=".75" stop-color="{col}" stop-opacity=".85"/><stop offset="1" stop-color="{col}" stop-opacity="0"/></linearGradient></defs>'
        out += f'<rect id="{r}" x="{x}" y="{top}" width="140" height="{y(reach) - top:.0f}" rx="10" fill="url(#{gid})"/>'
        out += f'<text x="{x + 70}" y="{top - 22}" text-anchor="middle" {TXT} font-size="44">{nm}</text>'
        tw(f"#{r}", {"scaleY": 1}, s(t0) + k * 0.35, 1.0, {"scaleY": 0, "svgOrigin": f"{x} {top}"}, "power2.out")
    i = nid("lr")
    out += f'<text id="{i}" x="380" y="{y(15) + 80:.0f}" font-family="League Gothic" font-size="64" fill="#ff8a70" opacity="0">RED IS GONE FIRST</text></svg>'
    tw(f"#{i}", {"opacity": 1}, s(t0) + 2.2, 0.5)
    return out


def world_pins(a, b, pins, focus=None, zoom=1.0):
    """World map with pins [(lon, lat, label, t)]; optional zoom toward focus=(lon, lat) (CSS transform on a wrapper, labels in screen space)."""
    W, Hh = WORLD["w"], WORLD["h"]; oy = (1080 - Hh) / 2
    P = lambda lon, lat: ((lon + 180) / 360 * W, (90 - lat) / 180 * Hh + oy)
    g = nid("wm")
    fx, fy = P(*focus) if focus else (960, 540)
    z = zoom if focus else 1.0
    out = bg2d(a, b, "dark") + f'<div id="{g}" style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0">' + SVG0
    out += f'<rect x="-500" y="-500" width="2920" height="2080" fill="#0b2433"/><path d="{WORLD["land"]}" transform="translate(0 {oy:.0f})" fill="#b9c8cf" stroke="#e8f0f4" stroke-width="{0.6 / z:.2f}"/>'
    labs = ""
    for lon, lat, text, t in pins:
        x, y = P(lon, lat); i = nid("pin")
        out += f'<g id="{i}" opacity="0"><circle cx="{x:.1f}" cy="{y:.1f}" r="{9 / z:.1f}" fill="#e0322b"/><circle cx="{x:.1f}" cy="{y:.1f}" r="{22 / z:.1f}" fill="none" stroke="#e0322b" stroke-width="{4 / z:.1f}"/></g>'
        tw(f"#{i}", {"opacity": 1}, t, 0.4)
        j = nid("pl")
        sx, sy = (x - fx) * z + 960, (y - fy) * z + 540
        labs += f'<div class="row" style="left:{max(40, min(1380, sx - 250)):.0f}px;width:500px;text-align:center;top:{min(980, sy + 40):.0f}px"><span id="{j}" class="stamp" style="font-size:60px">{text}</span></div>'
        show(f"#{j}", s(t) + 0.2)
    out += "</svg></div>" + labs
    if focus: tw(f"#{g}", {"scale": z, "x": 960 - fx * z, "y": 540 - fy * z}, a, 1.4, {"scale": 1, "x": 0, "y": 0}, "power2.inOut")
    return out


def years400(a, b, t0, t_sub):
    """A year counter running back four centuries."""
    out = bg2d(a, b, "dark")
    c, sub = nid("yr"), nid("ys")
    out += '<div class="bigsub" style="top:250px">A GREENLAND SHARK ALIVE TODAY MAY HAVE HATCHED AROUND</div>'
    out += f'<div id="{c}" class="big" style="top:350px;font-size:300px">2026</div>'
    out += f'<div class="bigsub" style="top:720px"><span id="{sub}" style="opacity:0;color:#ffd27a">2016 STUDY: SOME MAY LIVE AROUND 400 YEARS</span></div>'
    counter(c, s(t0), 3.2, 2026, 1626)
    tw(f"#{sub}", {"opacity": 1}, t_sub, 0.5)
    return out


def eye_plate(a, b, t_plate):
    """A giant squid eye beside a dinner plate of the same size."""
    out = bg2d(a, b, "ocean") + SVG0
    out += eye_svg(640, 520, 230, iris="#2a3440", glow=True)
    i = nid("pl")
    out += (f'<g id="{i}" opacity="0"><ellipse cx="1300" cy="520" rx="235" ry="235" fill="#f4f1ea" stroke="#d6d0c4" stroke-width="6"/>'
            f'<ellipse cx="1300" cy="520" rx="165" ry="165" fill="none" stroke="#e2ddd2" stroke-width="5"/></g>')
    out += f'<text x="640" y="860" text-anchor="middle" {TXT} font-size="64">GIANT SQUID EYE</text>'
    out += f'<text x="1300" y="860" text-anchor="middle" {TXT} font-size="64">DINNER PLATE</text></svg>'
    j = nid("pt"); out += f'<div class="bigsub" style="top:110px;font-size:80px"><span id="{j}" style="opacity:0;color:#ffd27a">UP TO ABOUT 27 CM ACROSS</span></div>'
    tw(f"#{i}", {"opacity": 1}, t_plate, 0.5); tw(f"#{j}", {"opacity": 1}, s(t_plate) + 0.5, 0.5)
    return out


def recap_grid(a, b, names, t0, every=0.22):
    """The predators we met, popping in as cut-out tiles."""
    out = bg2d(a, b, "dark")
    cols = 5; cw, ch = 330, 230; x0 = (1920 - cols * cw) / 2; y0 = 200
    for k, name in enumerate(names):
        p, iw, ih = cutout(name)
        sc = min((cw - 40) / iw, (ch - 40) / ih); w, hh = iw * sc, ih * sc
        x = x0 + (k % cols) * cw + (cw - w) / 2; y = y0 + (k // cols) * (ch + 30) + (ch - hh) / 2
        i = nid("rg")
        out += f'<img id="{i}" src="{p}" alt="{name}" style="position:absolute;left:{x:.0f}px;top:{y:.0f}px;width:{w:.0f}px;height:{hh:.0f}px;opacity:0;filter:drop-shadow(0 0 18px rgba(120,200,240,.35))">'
        pop(f"#{i}", s(t0) + k * every, 0.5)
    return out


def depth_card(a, b, big, sub, t_sub=None):
    """Depth card laid over the dive animation: a big number and the zone name."""
    i, j = nid("c"), nid("tx")
    out = f'<div id="{i}" class="big" style="top:330px;opacity:0">{big}</div><div class="bigsub" style="top:600px;letter-spacing:8px"><span id="{j}" style="opacity:0">{sub}</span></div>'
    pop(f"#{i}", s(a) + 0.2, 0.6, 1.2)
    if sub: tw(f"#{j}", {"opacity": 1}, t_sub or s(a) + 0.9, 0.5)
    tw(f"#{i}", {"opacity": 0}, s(b) - 0.45, 0.4); tw(f"#{j}", {"opacity": 0}, s(b) - 0.45, 0.4)
    return out


def endcard(a, b, t_sub):
    t1, bt = nid("tx"), nid("bt")
    out = dim(0.45) + f'<div id="{t1}" class="chap" style="top:330px;font-size:200px;opacity:0">UNSEEN KINGDOM</div>'
    tw(f"#{t1}", {"opacity": 1, "scale": 1}, s(a) + 0.4, 1.2, {"opacity": 0, "scale": 1.05})
    out += f'<div id="{bt}" class="subbtn" style="opacity:0">SUBSCRIBE</div>'
    pop(f"#{bt}", t_sub, 0.6)
    out += fade_out_black(s(b) - 2.0, 1.8)
    return out
