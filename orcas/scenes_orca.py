"""Graphics for Why Orcas Never Hunt Alone (SVG + HTML + GSAP). Each returns the inner HTML of a full-screen layer."""
from lib import *
from scenes2d import SVG0, TXT, SUB, show, pop, counter


def _orca_img(name, x, y, w, flip=False, eid=None, extra=""):
    p, iw, ih = cutout(name)
    h = ih * w / iw
    tr = "transform:scaleX(-1);" if flip else ""
    return f'<img {f"id={chr(34)}{eid}{chr(34)}" if eid else ""} src="{p}" alt="orca" style="position:absolute;left:{x - w / 2:.0f}px;top:{y - h / 2:.0f}px;width:{w:.0f}px;height:{h:.0f}px;{tr}filter:drop-shadow(0 10px 22px rgba(0,0,0,.55));opacity:0;{extra}">'


def family_tree(a, b, times):
    """Four generations around one grandmother: grandmother, her sons and daughters, a daughter's calves, a great-grandcalf."""
    out = bg2d(a, b, "ocean") + SVG0
    rows = [(200, [(960, 360, "orca_b", "GRANDMOTHER")]),
            (470, [(560, 300, "orca_a", "SON"), (960, 290, "orca_c", "DAUGHTER"), (1360, 300, "orca_a", "SON")]),
            (720, [(800, 230, "orca_c", "HER DAUGHTER"), (1120, 220, "orca_b", "HER SON")]),
            (930, [(800, 170, "orca_b", "GREAT-GRANDCALF")])]
    links = [((960, 260), (560, 420)), ((960, 260), (960, 420)), ((960, 260), (1360, 420)), ((960, 520), (800, 680)), ((960, 520), (1120, 680)), ((800, 760), (800, 900))]
    lids = []
    for (x0, y0), (x1, y1) in links:
        i = nid("ln"); lids.append(i)
        out += f'<path id="{i}" d="M{x0},{y0} C{x0},{(y0 + y1) / 2} {x1},{(y0 + y1) / 2} {x1},{y1}" fill="none" stroke="rgba(220,235,245,.45)" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    out += "</svg>"
    labs = ""
    for r, (y, items) in enumerate(rows):
        t = times[min(r, len(times) - 1)]
        for x, w, nm, lab in items:
            i = nid("ft"); out += _orca_img(nm, x, y, w, eid=i)
            j = nid("fl"); labs += f'<div class="row" style="left:{x - 200}px;width:400px;text-align:center;top:{y + 38}px"><span id="{j}" class="stamp" style="font-size:40px">{lab}</span></div>'
            show(f"#{i}", t, 0.6, 20); show(f"#{j}", s(t) + 0.2, 0.4, 10)
    for k, i in enumerate(lids):
        tw(f"#{i}", {"strokeDashoffset": 0}, s(times[min(1 + k // 3, len(times) - 1)]) - 0.3, 0.6, None, "power1.inOut")
    k = nid("ft"); out += labs + f'<div class="bigsub" style="top:60px"><span id="{k}" style="opacity:0;color:#ffd27a">UP TO FOUR GENERATIONS TOGETHER</span></div>'
    tw(f"#{k}", {"opacity": 1}, times[-1], 0.5)
    return out


def bars(a, b, title, items, t0, unit="", note=None, t_note=None, maxv=None, every=0.6):
    """Horizontal bars: items = [(label, value, colour, text shown at the end)]."""
    out = bg2d(a, b, "dark")
    mx = maxv or max(v for _, v, _, _ in items)
    out += f'<div class="bigsub" style="top:120px;font-size:76px;color:#fff">{title}</div>'
    y0 = 330
    for k, (lab, v, col, txt) in enumerate(items):
        y = y0 + k * 150; w = 1100 * v / mx; i, j = nid("bb"), nid("bt")
        out += f'<div class="row" style="left:120px;top:{y}px;width:440px;text-align:right;font-family:League Gothic;font-size:54px;color:#e6eef2">{lab}</div>'
        out += f'<div id="{i}" style="position:absolute;left:590px;top:{y + 6}px;height:66px;width:{w:.0f}px;background:{col};border-radius:8px;transform-origin:0 50%;transform:scaleX(0)"></div>'
        out += f'<div class="row" style="left:{610 + w:.0f}px;top:{y}px"><span id="{j}" class="stamp" style="font-size:56px">{txt}</span></div>'
        tw(f"#{i}", {"scaleX": 1}, s(t0) + k * every, 0.8, None, "power2.out"); show(f"#{j}", s(t0) + k * every + 0.6, 0.4, 10)
    if note:
        n = nid("bn"); out += f'<div class="bigsub" style="top:{y0 + len(items) * 150 + 40}px"><span id="{n}" style="opacity:0;color:#ffd27a">{note}</span></div>'
        tw(f"#{n}", {"opacity": 1}, t_note or s(t0) + len(items) * every + 0.8, 0.5)
    return out


def lifespan(a, b, t0, t_post):
    """A female orca's life on one line: calves from her teens to about 40, then decades more."""
    out = bg2d(a, b, "dark") + SVG0
    x0, x1, y = 200, 1720, 560
    X = lambda age: x0 + (x1 - x0) * age / 90
    out += f'<text x="960" y="200" text-anchor="middle" {TXT} font-size="84">A FEMALE ORCA\'S LIFE</text>'
    out += f'<line x1="{x0}" y1="{y + 70}" x2="{x1}" y2="{y + 70}" stroke="rgba(255,255,255,.4)" stroke-width="3"/>'
    for age in range(0, 91, 10):
        out += f'<line x1="{X(age):.0f}" y1="{y + 70}" x2="{X(age):.0f}" y2="{y + 90}" stroke="rgba(255,255,255,.5)" stroke-width="3"/><text x="{X(age):.0f}" y="{y + 130}" text-anchor="middle" {SUB} font-size="30">{age}</text>'
    i, j = nid("ls"), nid("lp")
    out += f'<rect id="{i}" x="{X(12):.0f}" y="{y - 40}" width="{X(40) - X(12):.0f}" height="80" rx="10" fill="#3fa9d6"/>'
    out += f'<rect id="{j}" x="{X(40):.0f}" y="{y - 40}" width="{X(85) - X(40):.0f}" height="80" rx="10" fill="#e8b04c"/>'
    out += f'<text id="{i}t" x="{(X(12) + X(40)) / 2:.0f}" y="{y - 70}" text-anchor="middle" {TXT} font-size="52" opacity="0">HAS CALVES</text>'
    out += f'<text id="{j}t" x="{(X(40) + X(85)) / 2:.0f}" y="{y - 70}" text-anchor="middle" {TXT} font-size="52" opacity="0" fill="#ffd27a">DECADES MORE: THE GRANDMOTHER YEARS</text></svg>'
    tw(f"#{i}", {"scaleX": 1}, t0, 1.0, {"scaleX": 0, "svgOrigin": f"{X(12):.0f} {y}"}, "power2.out"); tw(f"#{i}t", {"opacity": 1}, s(t0) + 0.6, 0.4)
    tw(f"#{j}", {"scaleX": 1}, t_post, 1.4, {"scaleX": 0, "svgOrigin": f"{X(40):.0f} {y}"}, "power2.out"); tw(f"#{j}t", {"opacity": 1}, s(t_post) + 0.8, 0.4)
    return out


def species_list(a, b, items, times, title):
    """A short list that builds line by line, the last one dimmer."""
    out = bg2d(a, b, "dark") + f'<div class="bigsub" style="top:140px;font-size:80px;color:#fff">{title}</div>'
    for k, (txt, t) in enumerate(zip(items, times)):
        i = nid("sp"); dim_ = k == len(items) - 1
        out += f'<div id="{i}" class="recap" style="top:{300 + k * 150}px;font-size:{90 if not dim_ else 70}px;opacity:0;color:{"#8fa3ad" if dim_ else "#fff"}">{txt}</div>'
        show(f"#{i}", t, 0.5, 20)
    return out


def ecotypes(a, b, t1, t2):
    """Two kinds of orca side by side: fish-eaters and mammal-hunters."""
    out = bg2d(a, b, "dark")
    for k, (x, title, lines, prey, t) in enumerate([(500, "FISH-EATERS", ["RESIDENTS", "BIG, NOISY FAMILIES", "SALMON, HERRING"], "salmon2", t1),
                                                     (1420, "MAMMAL-HUNTERS", ["BIGG'S / TRANSIENTS", "SMALL, SILENT GROUPS", "SEALS, PORPOISES, WHALES"], "harbor_seal", t2)]):
        c = nid("ec")
        out += f'<div id="{c}" class="fcard" style="left:{x - 400}px;top:180px;width:800px;height:720px;opacity:0;padding:30px;text-align:center">'
        out += f'<div style="font-family:League Gothic;font-size:96px;color:#fff">{title}</div>'
        p, iw, ih = cutout("orca_b" if k == 0 else "orca_a"); out += f'<img src="{p}" alt="" style="width:520px;margin:20px auto 0;display:block{";transform:scaleX(-1)" if k else ""}">'
        q, qw, qh = cutout(prey); out += f'<img src="{q}" alt="" style="height:110px;margin:6px auto;display:block">'
        for ln in lines: out += f'<div style="font-family:League Gothic;font-size:54px;color:#c9d6dc;margin-top:10px">{ln}</div>'
        out += "</div>"
        pop(f"#{c}", t, 0.6, 0.9)
    return out


def group_size(a, b, t0, t_peak):
    """Food per orca against group size (harbor seal hunts, 1990s study): best at about three."""
    out = bg2d(a, b, "dark") + SVG0
    x0, y0, x1, y1 = 300, 860, 1640, 360
    vals = [(1, 0.55), (2, 0.8), (3, 1.0), (4, 0.82), (5, 0.66), (6, 0.55), (7, 0.46)]
    X = lambda n: x0 + (x1 - x0) * (n - 1) / 6
    Y = lambda v: y0 - (y0 - y1) * v
    out += f'<text x="960" y="170" text-anchor="middle" {TXT} font-size="76">FOOD PER ORCA, BY GROUP SIZE</text>'
    out += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="rgba(255,255,255,.5)" stroke-width="3"/>'
    for n, _ in vals: out += f'<text x="{X(n):.0f}" y="{y0 + 60}" text-anchor="middle" {SUB} font-size="40">{n}</text>'
    out += f'<text x="960" y="{y0 + 120}" text-anchor="middle" {SUB} font-size="34">ORCAS IN THE HUNTING GROUP</text>'
    pts = " ".join(f"{X(n):.0f},{Y(v):.0f}" for n, v in vals)
    i = nid("gs")
    out += f'<polyline id="{i}" points="{pts}" fill="none" stroke="#7fe0ff" stroke-width="7" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    j = nid("gp")
    out += f'<g id="{j}" opacity="0"><circle cx="{X(3):.0f}" cy="{Y(1.0):.0f}" r="18" fill="#ffd27a"/><text x="{X(3):.0f}" y="{Y(1.0) - 40:.0f}" text-anchor="middle" font-family="League Gothic" font-size="64" fill="#ffd27a">BEST: ABOUT 3</text></g></svg>'
    tw(f"#{i}", {"strokeDashoffset": 0}, t0, 2.0, None, "power1.inOut"); tw(f"#{j}", {"opacity": 1}, t_peak, 0.5)
    return out


def lead_chart(a, b, t0, t_bad):
    """Who swims at the front: post-menopausal females lead, most of all when salmon is scarce."""
    return bars(a, b, "WHO LEADS THE FAMILY?", [("YOUNGER FEMALES", 0.35, "#5a7d8c", ""), ("GRANDMOTHERS, GOOD YEARS", 0.7, "#e8b04c", "OFTEN"),
                                                ("GRANDMOTHERS, SALMON-POOR YEARS", 1.0, "#ffd27a", "MOST OF ALL")], t0, maxv=1.0, every=1.0,
                note="2015 STUDY, SOUTHERN RESIDENT ORCAS", t_note=t_bad)
