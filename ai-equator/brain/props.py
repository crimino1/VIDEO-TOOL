"""Props for the 2D explainers: bubbles, weight grid, dials, game icons, Go board, car, pipe, arrows, tools."""
import random
from lib import tl, T
from toon import INK

PROPS_CSS = """
.bub{min-height:60px}
.bubin{position:relative;background:#fff;color:#17181C;border:5px solid #17181C;border-radius:26px;padding:16px 22px;font-family:Inter,sans-serif;font-weight:700;line-height:1.2}
.btail{position:absolute;bottom:-28px}
.wgrid .wc{position:absolute;background:#1A2236;border:2px solid #2A3550;border-radius:6px;color:#8FA3C8;font-family:"JetBrains Mono",monospace;font-size:13px;display:flex;align-items:center;justify-content:center}
.wgrid.dim .wc{opacity:.6}
"""


def bubble(eid, x, y, text, w=320, tail="left", size=30):
    tx = 40 if tail == "left" else w - 60
    tip = 8 if tail == "left" else 32
    return (f'<div id="{eid}" class="toon bub" style="left:{x}px;top:{y}px;width:{w}px">'
            f'<div class="bubin" style="font-size:{size}px">{text}</div>'
            f'<svg class="btail" style="left:{tx}px" width="40" height="34" viewBox="0 0 40 34"><path d="M2 0 L38 0 L{tip} 32Z" fill="#FFFFFF" stroke="{INK}" stroke-width="5" stroke-linejoin="round"/><rect x="0" y="-6" width="40" height="8" fill="#FFFFFF"/></svg></div>')


def numgrid(eid, x, y, cols=12, rows=8, cell=46, seed=5, dim=False):
    rnd = random.Random(seed)
    cells = []
    for r in range(rows):
        for c in range(cols):
            v = rnd.uniform(-.99, .99)
            cells.append(f'<div id="{eid}_{c}_{r}" class="wc" style="left:{c * cell}px;top:{r * cell}px;width:{cell - 4}px;height:{cell - 4}px">{v:+.2f}</div>')
    return f'<div id="{eid}" class="toon wgrid{" dim" if dim else ""}" style="left:{x}px;top:{y}px;width:{cols * cell}px;height:{rows * cell}px">{"".join(cells)}</div>'


def light(eid, cells, t, color="#F0A818"):
    sel = ", ".join(f"#{eid}_{c}_{r}" for c, r in cells)
    tl.append(f'tl.to("{sel}",{{backgroundColor:"{color}",color:"#111",duration:.2,stagger:.03}},{T(t):.3f});')


def column(eid, c, rows, t, color="#F0A818"):
    light(eid, [(c, r) for r in range(rows)], t, color)


def jitter(eid, cols, rows, a, b, n=40, seed=2):
    """Gradient descent: random cells flash slightly, again and again (blind nudges)."""
    rnd = random.Random(seed)
    step = (T(b) - T(a)) / n
    for i in range(n):
        c, r = rnd.randrange(cols), rnd.randrange(rows)
        tl.append(f'tl.fromTo("#{eid}_{c}_{r}",{{backgroundColor:"#3A4A72"}},{{backgroundColor:"#1A2236",duration:.35}},{T(a) + i * step:.3f});')


def dial(eid, x, y, r=46, color="#4F7DF3"):
    return (f'<div id="{eid}" class="toon" style="left:{x - r}px;top:{y - r}px;width:{2 * r}px;height:{2 * r}px">'
            f'<svg width="{2 * r}" height="{2 * r}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="{color}" stroke="{INK}" stroke-width="7"/>'
            f'<g id="{eid}_n"><line x1="50" y1="50" x2="50" y2="14" stroke="{INK}" stroke-width="8" stroke-linecap="round"/></g><circle cx="50" cy="50" r="8" fill="{INK}"/></svg></div>')


def turn(eid, t, deg, d=.4):
    tl.append(f'tl.to("#{eid}_n",{{rotation:"+={deg}",svgOrigin:"50 50",duration:{d},ease:"power2.inOut"}},{T(t):.3f});')


def icon(eid, x, y, kind, s=150):
    bricks = "".join(f'<rect x="{10 + i * 16}" y="{14 + j * 10}" width="14" height="8" fill="{["#E5484D", "#F2B33D", "#2FA36B", "#4F7DF3"][j]}"/>' for i in range(5) for j in range(4))
    lanes = "".join(f'<line x1="6" y1="{20 + i * 15}" x2="94" y2="{20 + i * 15}" stroke="#555" stroke-width="2"/>' for i in range(5))
    body = {
        "pacman": '<rect width="100" height="100" rx="18" fill="#101626"/><path d="M50 50 L86 30 A40 40 0 1 0 86 70Z" fill="#F7D046" stroke="#17181C" stroke-width="4"/><circle cx="52" cy="30" r="5" fill="#17181C"/>',
        "pong": '<rect width="100" height="100" rx="18" fill="#101626"/><rect x="12" y="30" width="8" height="34" fill="#fff"/><rect x="80" y="40" width="8" height="34" fill="#fff"/><circle cx="52" cy="50" r="6" fill="#fff"/><line x1="50" y1="8" x2="50" y2="92" stroke="#fff" stroke-dasharray="6 6" stroke-width="3"/>',
        "breakout": '<rect width="100" height="100" rx="18" fill="#101626"/>' + bricks + '<rect x="38" y="84" width="26" height="6" fill="#fff"/><circle cx="56" cy="64" r="5" fill="#fff"/>',
        "freeway": '<rect width="100" height="100" rx="18" fill="#101626"/>' + lanes + '<rect x="18" y="24" width="18" height="9" rx="3" fill="#E5484D"/><rect x="60" y="54" width="18" height="9" rx="3" fill="#4F7DF3"/><circle cx="50" cy="88" r="6" fill="#F7D046"/>',
    }[kind]
    return f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px"><svg width="{s}" height="{s}" viewBox="0 0 100 100">{body}</svg></div>'


def goboard(eid, x, y, s=420, n=9, seed=9, stones=26):
    rnd = random.Random(seed)
    g = s / (n + 1)
    lines = "".join(f'<line x1="{g:.1f}" y1="{g * (i + 1):.1f}" x2="{g * n:.1f}" y2="{g * (i + 1):.1f}"/><line x1="{g * (i + 1):.1f}" y1="{g:.1f}" x2="{g * (i + 1):.1f}" y2="{g * n:.1f}"/>' for i in range(n))
    pts = rnd.sample([(i, j) for i in range(n) for j in range(n)], stones)
    st = "".join(f'<circle class="stone" cx="{g * (i + 1):.1f}" cy="{g * (j + 1):.1f}" r="{g * .42:.1f}" fill="{"#111" if k % 2 == 0 else "#F4F4F4"}" stroke="#17181C" stroke-width="2.5" style="opacity:0"/>' for k, (i, j) in enumerate(pts))
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px"><svg width="{s}" height="{s}" viewBox="0 0 {s} {s}">'
            f'<rect width="{s}" height="{s}" rx="16" fill="#E1B56B" stroke="{INK}" stroke-width="6"/><g stroke="#5B3A12" stroke-width="2">{lines}</g>{st}</svg></div>')


def place_stones(eid, n, a, b):
    step = (T(b) - T(a)) / n
    tl.append(f'tl.to("#{eid} .stone",{{opacity:1,duration:.12,stagger:{step:.3f}}},{T(a):.3f});')


def car(eid, x, y, s=1.0, color="#E5484D"):
    w, h = int(420 * s), int(220 * s)
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"><svg width="{w}" height="{h}" viewBox="0 0 420 220" overflow="visible">'
            f'<rect x="20" y="90" width="380" height="80" rx="30" fill="{color}" stroke="{INK}" stroke-width="7"/>'
            f'<path d="M110 92 L150 40 L290 40 L330 92Z" fill="#BFE3FF" stroke="{INK}" stroke-width="7" stroke-linejoin="round"/>'
            f'<g id="{eid}_hood"><path d="M300 92 L404 98 L404 116 L300 112Z" fill="{color}" stroke="{INK}" stroke-width="6"/></g>'
            f'<circle cx="110" cy="172" r="34" fill="#2A2D35" stroke="{INK}" stroke-width="7"/><circle cx="310" cy="172" r="34" fill="#2A2D35" stroke="{INK}" stroke-width="7"/>'
            f'<circle cx="110" cy="172" r="12" fill="#9AA3B2"/><circle cx="310" cy="172" r="12" fill="#9AA3B2"/></svg></div>')


def pipe(eid, x, y, w=900):
    dots = "".join(f'<circle class="{eid}_f" cx="{30 + i * 60}" cy="60" r="12" fill="#5B8FF0" style="opacity:0"/>' for i in range(w // 60))
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{w}px;height:120px"><svg width="{w}" height="120" viewBox="0 0 {w} 120">'
            f'<rect x="0" y="22" width="{w}" height="76" rx="20" fill="#C9D1DC" stroke="{INK}" stroke-width="7"/>{dots}'
            f'<g id="{eid}_clog"><ellipse cx="{w * .55:.0f}" cy="60" rx="70" ry="34" fill="#8B6B3E" stroke="{INK}" stroke-width="6"/><circle cx="{w * .52:.0f}" cy="52" r="6" fill="{INK}"/><circle cx="{w * .58:.0f}" cy="52" r="6" fill="{INK}"/></g></svg></div>')


def unclog(eid, t, w=900):
    tl.append(f'tl.to("#{eid}_clog",{{x:{w * .5:.0f},opacity:0,duration:.6,ease:"power2.in"}},{T(t):.3f});')
    tl.append(f'tl.fromTo(".{eid}_f",{{opacity:0,x:-40}},{{opacity:1,x:40,duration:.8,stagger:.06,ease:"none"}},{T(t) + .3:.3f});')


def loop_arrow(eid, x, y, s=180, color="#F0A818"):
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px"><svg width="{s}" height="{s}" viewBox="0 0 100 100"><g id="{eid}_r">'
            f'<path d="M80 50 A30 30 0 1 1 65 24" fill="none" stroke="{color}" stroke-width="9" stroke-linecap="round"/><path d="M58 12 L72 24 L56 34" fill="none" stroke="{color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g></svg></div>')


def spin(eid, a, b, turns=3):
    tl.append(f'tl.to("#{eid}_r",{{rotation:{360 * turns},svgOrigin:"50 50",duration:{T(b) - T(a):.3f},ease:"none"}},{T(a):.3f});')


def wrench(eid, x, y, s=120):
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px"><svg width="{s}" height="{s}" viewBox="0 0 100 100">'
            f'<path d="M24 76 L66 34" stroke="{INK}" stroke-width="20" stroke-linecap="round"/><path d="M24 76 L66 34" stroke="#C9D1DC" stroke-width="11" stroke-linecap="round"/>'
            f'<path d="M60 16 A18 18 0 1 0 84 40 L74 36 L64 26Z" fill="#C9D1DC" stroke="{INK}" stroke-width="5"/></svg></div>')


def magnifier(eid, x, y, s=170):
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px"><svg width="{s}" height="{s}" viewBox="0 0 100 100">'
            f'<circle cx="42" cy="42" r="28" fill="rgba(191,227,255,.35)" stroke="{INK}" stroke-width="7"/><path d="M62 62 L88 88" stroke="{INK}" stroke-width="12" stroke-linecap="round"/></svg></div>')


def blindfold(eid, x, y, w=124):
    """A black band laid over a bean's eyes; place at the bean's eye height."""
    return f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{w}px;height:26px;background:#17181C;border-radius:10px"></div>'
