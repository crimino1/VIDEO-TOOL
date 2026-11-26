"""2D cartoon kit for AI Equator explainers: bean people, bean robots, a neuron 'brain', simple props.
Thick dark outlines, flat colours, dot eyes. Every part has an id so GSAP can animate it.
All motion is a finite tween list (no infinite repeats), so frames are deterministic."""
from lib import tl, T

INK = "#17181C"
SKIN = ["#F2C9A0", "#D9A273", "#A8714A", "#7A4E2E"]
SHIRT = {"blue": "#4F7DF3", "red": "#E5484D", "green": "#2FA36B", "yellow": "#F2B33D", "purple": "#8B5CF6", "teal": "#14B8A6", "grey": "#9AA3B2", "white": "#F4F5F7"}


def _arm(cx, cy, side, color, pid):
    sx = -1 if side == "L" else 1
    return (f'<g id="{pid}" style="transform-origin:{cx}px {cy}px">'
            f'<path d="M{cx} {cy} Q{cx + sx * 26} {cy + 30} {cx + sx * 18} {cy + 62}" fill="none" stroke="{INK}" stroke-width="13" stroke-linecap="round"/>'
            f'<path d="M{cx} {cy} Q{cx + sx * 26} {cy + 30} {cx + sx * 18} {cy + 62}" fill="none" stroke="{color}" stroke-width="7" stroke-linecap="round"/></g>')


def bean(eid, x, y, s=1.0, shirt="blue", skin=0, kind="human", hair=None, glasses=False, coat=False, label=None):
    """A bean character, feet at (x, y). Native size about 140 x 260 px before scale."""
    c = SHIRT.get(shirt, shirt)
    sk = SKIN[skin] if kind == "human" else "#C9D1DC"
    parts = []
    # legs
    parts.append(f'<g id="{eid}_legL" style="transform-origin:58px 200px"><rect x="50" y="196" width="18" height="58" rx="9" fill="{INK}"/></g>')
    parts.append(f'<g id="{eid}_legR" style="transform-origin:84px 200px"><rect x="76" y="196" width="18" height="58" rx="9" fill="{INK}"/></g>')
    # body
    body_fill = "#FFFFFF" if coat else c
    parts.append(f'<rect id="{eid}_body" x="22" y="112" width="100" height="104" rx="44" fill="{body_fill}" stroke="{INK}" stroke-width="6"/>')
    if coat:
        parts.append(f'<path d="M72 116 L72 214" stroke="{INK}" stroke-width="4"/><rect x="58" y="118" width="28" height="22" rx="6" fill="{c}" stroke="{INK}" stroke-width="4"/>')
    parts.append(_arm(30, 140, "L", body_fill, f"{eid}_armL"))
    parts.append(_arm(114, 140, "R", body_fill, f"{eid}_armR"))
    # head
    hx, hy, hr = 72, 66, 54
    if kind == "robot":
        parts.append(f'<g id="{eid}_head"><rect x="{hx - 56}" y="{hy - 50}" width="112" height="98" rx="26" fill="#DDE3EC" stroke="{INK}" stroke-width="6"/>'
                     f'<rect x="{hx - 42}" y="{hy - 34}" width="84" height="64" rx="16" fill="#0E1626" stroke="{INK}" stroke-width="4"/>'
                     f'<line x1="{hx}" y1="{hy - 50}" x2="{hx}" y2="{hy - 70}" stroke="{INK}" stroke-width="6"/><circle id="{eid}_ant" cx="{hx}" cy="{hy - 74}" r="9" fill="{c}" stroke="{INK}" stroke-width="5"/>'
                     f'<g id="{eid}_eyes" style="transform-origin:{hx}px {hy - 4}px"><rect x="{hx - 26}" y="{hy - 14}" width="16" height="22" rx="7" fill="{c}"/><rect x="{hx + 10}" y="{hy - 14}" width="16" height="22" rx="7" fill="{c}"/></g>'
                     f'<path id="{eid}_mouth" d="M{hx - 14} {hy + 16} Q{hx} {hy + 24} {hx + 14} {hy + 16}" fill="none" stroke="{c}" stroke-width="5" stroke-linecap="round" style="transform-origin:{hx}px {hy + 18}px"/></g>')
    else:
        hair_svg = ""
        if hair == "short":
            hair_svg = f'<path d="M{hx - 50} {hy - 8} Q{hx - 46} {hy - 62} {hx} {hy - 58} Q{hx + 48} {hy - 62} {hx + 52} {hy - 8} Q{hx + 30} {hy - 34} {hx - 50} {hy - 8}Z" fill="{INK}"/>'
        elif hair == "bun":
            hair_svg = f'<circle cx="{hx}" cy="{hy - 62}" r="18" fill="#3B2A20" stroke="{INK}" stroke-width="5"/><path d="M{hx - 52} {hy - 4} Q{hx - 40} {hy - 64} {hx} {hy - 56} Q{hx + 44} {hy - 62} {hx + 52} {hy - 4} Q{hx + 10} {hy - 30} {hx - 52} {hy - 4}Z" fill="#3B2A20"/>'
        gl = (f'<circle cx="{hx - 18}" cy="{hy - 2}" r="13" fill="none" stroke="{INK}" stroke-width="4"/><circle cx="{hx + 18}" cy="{hy - 2}" r="13" fill="none" stroke="{INK}" stroke-width="4"/>'
              f'<line x1="{hx - 5}" y1="{hy - 2}" x2="{hx + 5}" y2="{hy - 2}" stroke="{INK}" stroke-width="4"/>') if glasses else ""
        parts.append(f'<g id="{eid}_head"><circle cx="{hx}" cy="{hy}" r="{hr}" fill="{sk}" stroke="{INK}" stroke-width="6"/>{hair_svg}'
                     f'<g id="{eid}_eyes" style="transform-origin:{hx}px {hy - 2}px"><circle cx="{hx - 18}" cy="{hy - 2}" r="6" fill="{INK}"/><circle cx="{hx + 18}" cy="{hy - 2}" r="6" fill="{INK}"/></g>{gl}'
                     f'<path id="{eid}_mouth" d="M{hx - 14} {hy + 22} Q{hx} {hy + 32} {hx + 14} {hy + 22}" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round" style="transform-origin:{hx}px {hy + 26}px"/></g>')
    lab = f'<div class="tlab">{label}</div>' if label else ""
    w, h = int(144 * s), int(260 * s)
    return (f'<div id="{eid}" class="toon" style="left:{x - w // 2}px;top:{y - h}px;width:{w}px;height:{h}px">'
            f'<svg width="{w}" height="{h}" viewBox="0 -20 144 280" overflow="visible">{"".join(parts)}</svg>{lab}</div>')


# ---------- motion
def appear(eid, t, dy=40):
    tl.append(f'tl.fromTo("#{eid}",{{opacity:0,y:{dy}}},{{opacity:1,y:0,duration:.35,ease:"back.out(1.6)"}},{T(t):.3f});')


def bob(eid, a, b, amp=6, period=.9):
    n = max(1, int((T(b) - T(a)) / period))
    tl.append(f'tl.to("#{eid}_body, #{eid}_head",{{y:-{amp},duration:{period / 2:.3f},ease:"sine.inOut",yoyo:true,repeat:{n * 2 - 1}}},{T(a):.3f});')


def blink(eid, times):
    for t in times:
        tl.append(f'tl.to("#{eid}_eyes",{{scaleY:.1,transformOrigin:"50% 50%",duration:.07,yoyo:true,repeat:1}},{T(t):.3f});')


def talk(eid, a, b):
    n = max(1, int((T(b) - T(a)) / .18))
    tl.append(f'tl.to("#{eid}_mouth",{{scaleY:1.9,transformOrigin:"50% 0%",duration:.09,yoyo:true,repeat:{n * 2 - 1},ease:"none"}},{T(a):.3f});')


def wave(eid, t, side="R", n=3):
    r = -1 if side == "R" else 1
    o = "114 140" if side == "R" else "30 140"
    tl.append(f'tl.to("#{eid}_arm{side}",{{rotation:{r * 140},svgOrigin:"{o}",duration:.25,ease:"power2.out"}},{T(t):.3f});')
    tl.append(f'tl.to("#{eid}_arm{side}",{{rotation:{r * 110},duration:.18,yoyo:true,repeat:{n * 2 - 1}}},{T(t) + .25:.3f});')
    tl.append(f'tl.to("#{eid}_arm{side}",{{rotation:0,duration:.3}},{T(t) + .25 + .18 * n * 2:.3f});')


def point(eid, t, side="R", hold=1.5):
    r = -1 if side == "R" else 1
    o = "114 140" if side == "R" else "30 140"
    tl.append(f'tl.to("#{eid}_arm{side}",{{rotation:{r * 75},svgOrigin:"{o}",duration:.25,ease:"power2.out"}},{T(t):.3f});')
    tl.append(f'tl.to("#{eid}_arm{side}",{{rotation:0,duration:.3}},{T(t) + hold:.3f});')


def walk(eid, a, b, dx):
    d = T(b) - T(a)
    tl.append(f'tl.to("#{eid}",{{x:"+={dx}",duration:{d:.3f},ease:"none"}},{T(a):.3f});')
    n = max(1, int(d / .3))
    tl.append(f'tl.fromTo("#{eid}_legL",{{rotation:-18,svgOrigin:"59 200"}},{{rotation:18,svgOrigin:"59 200",duration:.3,yoyo:true,repeat:{n - 1},ease:"sine.inOut"}},{T(a):.3f});')
    tl.append(f'tl.fromTo("#{eid}_legR",{{rotation:18,svgOrigin:"85 200"}},{{rotation:-18,svgOrigin:"85 200",duration:.3,yoyo:true,repeat:{n - 1},ease:"sine.inOut"}},{T(a):.3f});')
    tl.append(f'tl.set("#{eid}_legL, #{eid}_legR",{{rotation:0}},{T(b):.3f});')


def shock(eid, t):
    tl.append(f'tl.to("#{eid}_eyes",{{scale:1.6,transformOrigin:"50% 50%",duration:.15,ease:"back.out(3)"}},{T(t):.3f});')
    tl.append(f'tl.to("#{eid}_mouth",{{scaleY:-1.4,transformOrigin:"50% 50%",duration:.15}},{T(t):.3f});')
    tl.append(f'tl.to("#{eid}",{{y:-18,duration:.12,yoyo:true,repeat:1}},{T(t):.3f});')
    tl.append(f'tl.to("#{eid}_eyes, #{eid}_mouth",{{scale:1,scaleY:1,duration:.3}},{T(t) + 1.6:.3f});')


# ---------- the 'brain': a neural network of neurons, any neuron can glow
def brain(eid, x, y, w=820, h=560, cols=(6, 9, 9, 9, 6), glow=None, seed=3):
    """A neuron network inside a soft brain-shaped glass. Neurons get ids {eid}_n{col}_{row}."""
    import random
    rnd = random.Random(seed)
    xs = [x + 60 + i * (w - 120) / (len(cols) - 1) for i in range(len(cols))]
    pos = {}
    for ci, n in enumerate(cols):
        for r in range(n):
            pos[(ci, r)] = (xs[ci] - x, 70 + (h - 140) * (r + .5) / n + rnd.uniform(-8, 8))
    lines = []
    for ci in range(len(cols) - 1):
        for (a, ra), p in pos.items():
            if a != ci:
                continue
            for rb in rnd.sample(range(cols[ci + 1]), min(3, cols[ci + 1])):
                q = pos[(ci + 1, rb)]
                lines.append(f'<line class="syn" x1="{p[0]:.0f}" y1="{p[1]:.0f}" x2="{q[0]:.0f}" y2="{q[1]:.0f}"/>')
    dots = "".join(f'<circle id="{eid}_n{c}_{r}" class="neu" cx="{p[0]:.0f}" cy="{p[1]:.0f}" r="15"/>' for (c, r), p in pos.items())
    shell = f'<path d="M{w * .08} {h * .55} C{w * .02} {h * .1} {w * .3} {-h * .04} {w * .5} {h * .06} C{w * .7} {-h * .04} {w * .98} {h * .1} {w * .92} {h * .55} C{w * .98} {h * .95} {w * .6} {h * 1.02} {w * .5} {h * .9} C{w * .4} {h * 1.02} {w * .02} {h * .95} {w * .08} {h * .55}Z" class="shell"/>'
    return (f'<div id="{eid}" class="toon" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">'
            f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" overflow="visible">{shell}<g class="syns">{"".join(lines)}</g>{dots}</svg></div>')


def fire(eid, cells, t, color="#F0A818", hold=None):
    sel = ", ".join(f"#{eid}_n{c}_{r}" for c, r in cells)
    tl.append(f'tl.to("{sel}",{{fill:"{color}",scale:1.35,transformOrigin:"50% 50%",duration:.25,stagger:.04,ease:"back.out(2)"}},{T(t):.3f});')
    if hold:
        tl.append(f'tl.to("{sel}",{{fill:"#2A3550",scale:1,duration:.3}},{T(t) + hold:.3f});')


TOON_CSS = """
.toon{position:absolute;opacity:0}
.toon svg{display:block;overflow:visible}
.tlab{position:absolute;left:50%;transform:translateX(-50%);bottom:-46px;white-space:nowrap;font-family:Inter,sans-serif;font-weight:700;font-size:26px;color:#fff;background:rgba(10,12,18,.8);padding:4px 14px;border-radius:8px}
.shell{fill:rgba(240,130,170,.10);stroke:#F28CB1;stroke-width:6}
.syn{stroke:rgba(140,160,210,.35);stroke-width:2.5}
.neu{fill:#2A3550;stroke:#17181C;stroke-width:4}
.room{position:absolute;inset:0}
"""
