"""Real math, drawn as crisp SVG in the white style: zeta zeros on the critical line, |zeta(1/2+it)|, the prime staircase.
Values are computed with mpmath (cached in mathviz.json), never hand-placed."""
import json, math
from pathlib import Path
from lib import item, nid, tl, T

CACHE = Path(__file__).parent / "mathviz.json"
INK, ACC, GRID, MUTE = "#111111", "#1D4ED8", "#E4E4E7", "#71717A"


def _data():
    if CACHE.exists():
        return json.loads(CACHE.read_text())
    import mpmath
    mpmath.mp.dps = 20
    zeros = [float(mpmath.zetazero(n).imag) for n in range(1, 16)]
    ts = [i * 0.1 for i in range(0, 521)]
    absz = [float(abs(mpmath.zeta(mpmath.mpc(0.5, t)))) for t in ts]
    primes = [p for p in range(2, 101) if all(p % d for d in range(2, int(p ** .5) + 1))]
    li = [(x, float(mpmath.li(x)) - float(mpmath.li(2))) for x in range(2, 101)]
    d = {"zeros": zeros, "ts": ts, "absz": absz, "primes": primes, "li": li}
    CACHE.write_text(json.dumps(d))
    return d


D = _data()


def _draw(pid, t, d):
    tl.append(f'tl.fromTo("#{pid}",{{strokeDashoffset:1}},{{strokeDashoffset:0,duration:{d},ease:"power1.inOut"}},{T(t):.3f});')


def _pop(sel, t):
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,scale:0,transformOrigin:"50% 50%"}},{{opacity:1,scale:1,duration:.3,ease:"back.out(2)"}},{T(t):.3f});')


def strip(t, w=760, h=640, n=10, t_zero=None, gap=.45):
    """The critical strip 0 < Re(s) < 1 with the critical line Re = 1/2 and the first n nontrivial zeros on it."""
    zs = D["zeros"][:n]
    top = zs[-1] + 3
    X = lambda re: 120 + re * (w - 200)
    Y = lambda im: h - 50 - im / top * (h - 100)
    lid, dots, last = nid("ln"), "", 1e9
    t_zero = t_zero if t_zero is not None else t + .8
    for i, z in enumerate(zs):
        did = nid("zd")
        lab = ""
        if last - Y(z) >= 26:  # skip a label that would crowd the one below it; the dot stays
            lab = f'<text x="{X(.5) + 22:.1f}" y="{Y(z) + 7:.1f}" font-size="20" font-family="JetBrains Mono" fill="{MUTE}">½ + {z:.3f}i</text>'
            last = Y(z)
        dots += f'<g id="{did}" style="opacity:0"><circle cx="{X(.5):.1f}" cy="{Y(z):.1f}" r="9" fill="{ACC}"/>{lab}</g>'
        _pop(f"#{did}", t_zero + i * gap)
    _draw(lid, t + .2, .8)
    svg = (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
           f'<rect x="{X(0):.1f}" y="40" width="{X(1) - X(0):.1f}" height="{h - 90}" fill="#F4F4F5"/>'
           f'<line x1="60" y1="{Y(0):.1f}" x2="{w - 20}" y2="{Y(0):.1f}" stroke="{INK}" stroke-width="2"/>'
           f'<line x1="{X(0):.1f}" y1="30" x2="{X(0):.1f}" y2="{h - 40}" stroke="{GRID}" stroke-width="2"/>'
           f'<line x1="{X(1):.1f}" y1="30" x2="{X(1):.1f}" y2="{h - 40}" stroke="{GRID}" stroke-width="2"/>'
           f'<path id="{lid}" d="M{X(.5):.1f} {h - 40} L{X(.5):.1f} 30" stroke="{ACC}" stroke-width="3" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
           f'<text x="{X(0) - 8:.1f}" y="{h - 16}" font-size="22" font-family="JetBrains Mono" fill="{MUTE}" text-anchor="middle">0</text>'
           f'<text x="{X(1) + 8:.1f}" y="{h - 16}" font-size="22" font-family="JetBrains Mono" fill="{MUTE}" text-anchor="middle">1</text>'
           f'<text x="{X(.5):.1f}" y="{h - 16}" font-size="22" font-family="JetBrains Mono" fill="{ACC}" text-anchor="middle">Re(s) = ½</text>'
           f'{dots}</svg>')
    return item(t, svg, "mviz", f"width:{w}px")


def zcurve(t, w=1500, h=420, d=4.0):
    """|zeta(1/2 + it)| for 0 <= t <= 52: the line that keeps touching zero, exactly at the zeros."""
    ts, ys = D["ts"], D["absz"]
    ymax = 4.2
    X = lambda x: 60 + x / 52 * (w - 90)
    Y = lambda y: h - 50 - min(y, ymax) / ymax * (h - 90)
    path = "M" + " L".join(f"{X(a):.1f} {Y(b):.1f}" for a, b in zip(ts, ys))
    pid = nid("zc")
    _draw(pid, t + .2, d)
    ticks = "".join(f'<line x1="{X(z):.1f}" y1="{Y(0) - 10:.1f}" x2="{X(z):.1f}" y2="{Y(0) + 10:.1f}" stroke="{ACC}" stroke-width="3"/>' for z in D["zeros"] if z < 52)
    labels = "".join(f'<text x="{X(x):.1f}" y="{h - 14}" font-size="20" font-family="JetBrains Mono" fill="{MUTE}" text-anchor="middle">{x}</text>' for x in (0, 10, 20, 30, 40, 50))
    svg = (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
           f'<line x1="50" y1="{Y(0):.1f}" x2="{w - 20}" y2="{Y(0):.1f}" stroke="{INK}" stroke-width="2"/>{ticks}{labels}'
           f'<path id="{pid}" d="{path}" stroke="{INK}" stroke-width="3" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" stroke-linejoin="round"/>'
           f'<text x="60" y="34" font-size="24" font-family="JetBrains Mono" fill="{MUTE}">|ζ(½ + it)|</text>'
           f'<text x="{w - 30}" y="{h - 14}" font-size="20" font-family="JetBrains Mono" fill="{MUTE}" text-anchor="end">t</text></svg>')
    return item(t, svg, "mviz", f"width:{w}px")


def staircase(t, w=900, h=560, d=3.0):
    """The prime counting function pi(x) up to 100 against the smooth Li(x) - Li(2): primes look random, the trend is smooth."""
    ps, li = D["primes"], D["li"]
    X = lambda x: 70 + x / 100 * (w - 110)
    Y = lambda y: h - 50 - y / 30 * (h - 90)
    path, c = f"M{X(0):.1f} {Y(0):.1f}", 0
    for p in ps:
        path += f" L{X(p):.1f} {Y(c):.1f} L{X(p):.1f} {Y(c + 1):.1f}"
        c += 1
    path += f" L{X(100):.1f} {Y(c):.1f}"
    lpath = "M" + " L".join(f"{X(x):.1f} {Y(y):.1f}" for x, y in li)
    a, b = nid("st"), nid("li")
    _draw(a, t + .2, d)
    _draw(b, t + .6 + d * .6, 1.6)
    labels = "".join(f'<text x="{X(x):.1f}" y="{h - 16}" font-size="20" font-family="JetBrains Mono" fill="{MUTE}" text-anchor="middle">{x}</text>' for x in (0, 25, 50, 75, 100))
    svg = (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
           f'<line x1="60" y1="{Y(0):.1f}" x2="{w - 20}" y2="{Y(0):.1f}" stroke="{INK}" stroke-width="2"/>{labels}'
           f'<path id="{b}" d="{lpath}" stroke="{ACC}" stroke-width="3" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
           f'<path id="{a}" d="{path}" stroke="{INK}" stroke-width="3" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
           f'<text x="80" y="40" font-size="24" font-family="JetBrains Mono" fill="{INK}">π(x): primes up to x</text>'
           f'<text x="80" y="74" font-size="24" font-family="JetBrains Mono" fill="{ACC}">Li(x): the smooth estimate</text></svg>')
    return item(t, svg, "mviz", f"width:{w}px")
