"""Graphics for The Only Animal Orcas Won't Hunt (HTML + SVG + GSAP)."""
from lib import *
from scenes2d import SVG0, TXT, SUB, show, pop, counter

THEORY_COL = ["#3fa9d6", "#7fe0c0", "#e8b04c", "#c58cf0"]


def word_flip(a, b, t_flip):
    """WHALE KILLER becomes KILLER WHALE: the two words swap places."""
    out = bg2d(a, b, "dark")
    w1, w2, c = nid("w"), nid("w"), nid("c")
    out += f'<div id="{c}" class="bigsub" style="top:250px;font-size:64px;opacity:0">WHAT SAILORS CALLED THEM</div>'
    out += f'<div id="{w1}" class="big" style="top:420px;left:-430px;font-size:220px">WHALE</div>'
    out += f'<div id="{w2}" class="big" style="top:420px;left:470px;font-size:220px;color:#e05a4a">KILLER</div>'
    tw(f"#{c}", {"opacity": 1}, s(a) + 0.2, 0.5)
    tw(f"#{w1}", {"left": 470, "color": "#ffffff"}, t_flip, 0.9, None, "power2.inOut")
    tw(f"#{w2}", {"left": -430, "y": 0}, t_flip, 0.9, None, "power2.inOut")
    tw(f"#{c}", {"opacity": 0}, s(t_flip) - 0.2, 0.3)
    return out


def theory_card(a, b, n, title, sub=None):
    """A numbered theory card in its own colour."""
    col = THEORY_COL[(n - 1) % 4]
    i, j, k = nid("tn"), nid("tt"), nid("ts")
    out = bg2d(a, b, "dark")
    out += f'<div id="{i}" class="big" style="top:240px;font-size:150px;color:{col};opacity:0;letter-spacing:12px">THEORY {n}</div>'
    out += f'<div id="{j}" class="big" style="top:430px;font-size:190px;opacity:0">{title}</div>'
    if sub: out += f'<div id="{k}" class="bigsub" style="top:680px;opacity:0">{sub}</div>'
    out += f'<div style="position:absolute;left:760px;top:400px;width:400px;height:8px;background:{col};border-radius:4px"></div>'
    pop(f"#{i}", s(a) + 0.15, 0.5); show(f"#{j}", s(a) + 0.5, 0.6, 30)
    if sub: show(f"#{k}", s(a) + 1.1)
    return out


def menus(a, b, t1, t2):
    """Two orcas, same ocean, two menus."""
    out = bg2d(a, b, "dark")
    for k, (x, head, items, t) in enumerate([(500, "RESIDENTS", ["SALMON", "SALMON", "MORE SALMON", "(NOT SEALS)"], t1),
                                               (1420, "BIGG'S", ["SEALS", "SEA LIONS", "PORPOISES", "WHALES"], t2)]):
        c = nid("mn")
        out += f'<div id="{c}" style="position:absolute;left:{x - 330}px;top:170px;width:660px;height:760px;opacity:0;background:#f1ece0;border-radius:10px;box-shadow:0 30px 80px rgba(0,0,0,.7);padding:40px;text-align:center;font-family:EB Garamond,serif;color:#2a2420">'
        out += f'<div style="font-size:44px;letter-spacing:10px">— MENU —</div><div style="font-family:League Gothic;font-size:96px;margin-top:10px">{head}</div><div style="height:3px;background:#2a2420;margin:20px 60px"></div>'
        for it in items: out += f'<div style="font-size:58px;margin-top:22px;{"color:#a0362b;font-style:italic" if it.startswith("(") else ""}">{it}</div>'
        out += "</div>"
        pop(f"#{c}", t, 0.6, 0.9)
    return out


def day_counter(a, b, t0, t_end, n=75, sub=None):
    """A day counter over a scene (transparent background)."""
    c, l = nid("dc"), nid("dl")
    out = f'<div class="bigsub" style="top:150px;font-size:70px"><span id="{l}" style="opacity:0">DAYS WITHOUT EATING</span></div><div id="{c}" class="big" style="top:250px;font-size:300px;opacity:0">0</div>'
    tw(f"#{l}", {"opacity": 1}, t0, 0.4); tw(f"#{c}", {"opacity": 1}, t0, 0.4)
    counter(c, s(t0), s(t_end) - s(t0), 0, n)
    if sub:
        k = nid("ds"); out += f'<div class="bigsub" style="top:600px"><span id="{k}" style="opacity:0;color:#ffd27a">{sub}</span></div>'; tw(f"#{k}", {"opacity": 1}, s(t_end) + 0.2, 0.5)
    return out


def fuel(a, b, t0, every=0.9):
    """How much energy each meal carries: blubber and oil versus a lean, bony human."""
    out = bg2d(a, b, "dark") + '<div class="bigsub" style="top:110px;font-size:76px;color:#fff">HOW RICH IS THE MEAL?</div>'
    items = [("harbor_seal", "SEAL · THICK BLUBBER", 1.0, "#e8b04c"), ("salmon2", "SALMON · RICH AND OILY", 0.75, "#f08a5a"), ("c_white", "SHARK LIVER · PACKED WITH OIL", 0.9, "#ffd27a"),
             ("diver_sil", "HUMAN · BONY AND LEAN", 0.28, "#7d97a3")]
    for k, (img_, lab, v, col) in enumerate(items):
        y = 260 + k * 190
        if img_.startswith("c_"): p, iw, ih = f"assets/cards/{img_}.jpg", 3, 2
        else: p, iw, ih = cutout(img_)
        hh = 120; ww = min(260, iw * hh / ih)
        filt = "filter:invert(1) brightness(.9);" if img_ == "diver_sil" else ("border-radius:8px;object-fit:cover;" if img_.startswith("c_") else "")
        i, j, q = nid("fb"), nid("fl"), nid("fi")
        out += f'<img id="{q}" src="{p}" alt="" style="position:absolute;left:{270 - ww / 2:.0f}px;top:{y:.0f}px;height:{hh}px;width:{ww:.0f}px;object-fit:contain;opacity:0;{filt}">'
        out += f'<div style="position:absolute;left:460px;top:{y + 30}px;width:1100px;height:60px;border-radius:30px;background:rgba(255,255,255,.08)"></div>'
        out += f'<div id="{i}" style="position:absolute;left:460px;top:{y + 30}px;width:{1100 * v:.0f}px;height:60px;border-radius:30px;background:{col};transform-origin:0 50%;transform:scaleX(0)"></div>'
        out += f'<div class="row" style="left:480px;top:{y - 30}px"><span id="{j}" class="stamp" style="font-size:46px">{lab}</span></div>'
        show(f"#{q}", s(t0) + k * every, 0.4, 10); tw(f"#{i}", {"scaleX": 1}, s(t0) + k * every + 0.2, 0.8, None, "power2.out"); show(f"#{j}", s(t0) + k * every + 0.3, 0.4, 10)
    return out


def otter_crash(a, b, t0, t_drop):
    """Aleutian sea otters: a steep drop through the 1990s."""
    out = bg2d(a, b, "dark") + SVG0
    x0, y0, x1, y1 = 300, 860, 1640, 300
    yrs = [(1985, 1.0), (1990, 0.95), (1993, 0.7), (1995, 0.5), (1997, 0.3), (2000, 0.15)]
    X = lambda yr: x0 + (x1 - x0) * (yr - 1985) / 15; Y = lambda v: y0 - (y0 - y1) * v
    out += f'<text x="960" y="180" text-anchor="middle" {TXT} font-size="76">SEA OTTERS, ALEUTIAN ISLANDS</text>'
    out += f'<line x1="{x0}" y1="{y0}" x2="{x1}" y2="{y0}" stroke="rgba(255,255,255,.5)" stroke-width="3"/>'
    for yr in (1985, 1990, 1995, 2000): out += f'<text x="{X(yr):.0f}" y="{y0 + 60}" text-anchor="middle" {SUB} font-size="38">{yr}</text>'
    pts = " ".join(f"{X(yr):.0f},{Y(v):.0f}" for yr, v in yrs)
    i, j = nid("oc"), nid("ol")
    out += f'<polyline id="{i}" points="{pts}" fill="none" stroke="#e05a4a" stroke-width="8" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>'
    out += f'<text id="{j}" x="{X(1997):.0f}" y="{Y(0.3) - 40:.0f}" font-family="League Gothic" font-size="60" fill="#ff8a70" opacity="0">VANISHING</text></svg>'
    tw(f"#{i}", {"strokeDashoffset": 0}, t0, 2.4, None, "power1.inOut"); tw(f"#{j}", {"opacity": 1}, t_drop, 0.5)
    out += '<div class="credit">Simplified from Estes et al. 1998, Science</div>'
    return out


def four_tiles(a, b, times):
    """The four theories as coloured tiles."""
    out = bg2d(a, b, "dark")
    names = ["FOOD TRADITIONS", "TOO STRANGE", "NOT WORTH IT", "SOMETHING ELSE"]
    for k, (nm, t) in enumerate(zip(names, times)):
        x = 140 + (k % 2) * 840; y = 220 + (k // 2) * 340; i = nid("ft")
        out += f'<div id="{i}" style="position:absolute;left:{x}px;top:{y}px;width:800px;height:300px;border-radius:14px;background:rgba(10,24,32,.85);box-shadow:0 0 0 3px {THEORY_COL[k]},0 30px 70px rgba(0,0,0,.6);opacity:0;text-align:center">'
        out += f'<div style="font-family:League Gothic;font-size:60px;color:{THEORY_COL[k]};margin-top:40px;letter-spacing:6px">THEORY {k + 1}</div><div style="font-family:League Gothic;font-size:110px;color:#fff">{nm}</div></div>'
        pop(f"#{i}", t, 0.5)
    return out
