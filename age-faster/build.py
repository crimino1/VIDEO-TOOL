"""Writes index.html for "Stop doing these, they age faster": stock + photos + motion graphics + 2D animation, cut to vo.mp3.
Run: python build.py   (times are voiceover seconds, taken from words.json)"""
from pathlib import Path

HERE = Path(__file__).resolve().parent
DUR = 320.6
G, G2, Y, R, CREAM, INK = "#0b5a3a", "#0f6e47", "#ffd21f", "#e63946", "#fff8ec", "#10241b"

items, tw = [], []
n = [0]
def uid(p):
    n[0] += 1
    return f"{p}{n[0]}"
def T(js):
    tw.append(js)
def clip(cid, t0, t1, cls, inner, z, tag="div", extra=""):
    return f'<{tag} id="{cid}" class="clip {cls}" data-start="{t0:.2f}" data-duration="{t1 - t0:.2f}" data-track-index="{z}" style="z-index:{z}"{extra}>{inner}</{tag}>'

# ---------- footage ----------
MOVES = [({"scale": 1.0}, {"scale": 1.08}), ({"scale": 1.1, "x": -40}, {"scale": 1.1, "x": 40}), ({"scale": 1.08}, {"scale": 1.0}), ({"scale": 1.1, "x": 40}, {"scale": 1.1, "x": -40})]
def js(d):
    return "{" + ",".join(f"{k}:{v}" for k, v in d.items()) + "}"
def V(t0, t1, src, off=0.0, z=1, move=None, rate=None):
    """Full-frame stock clip with a slow move on its wrapper."""
    w = uid("w")
    r = f' data-playback-rate="{rate}"' if rate else ""
    items.append(f'<div class="frame" id="{w}" style="z-index:{z}"><video id="{w}v" class="clip full" src="assets/stock/{src}.mp4" muted playsinline data-start="{t0:.2f}" data-duration="{t1 - t0:.2f}" data-media-start="{off}" data-track-index="{z}"{r}></video></div>')
    a, b = MOVES[n[0] % 4] if move is None else move
    T(f'tl.fromTo("#{w}",{js(a)},{{...{js(b)},duration:{t1 - t0:.2f},ease:"none"}},{t0:.2f});')

def CUE(t0, t1, text, pos="bottom"):
    """Large readable caption pill (channel style: Poppins bold, white on dark green)."""
    c = uid("c")
    items.append(clip(c, t0, t1, "", f'<span class="cue {pos}" id="{c}i">{text}</span>', 9))
    T(f'tl.fromTo("#{c}i",{{opacity:0,y:24}},{{opacity:1,y:0,duration:0.4,ease:"expo.out"}},{t0 + 0.05:.2f});')
    T(f'tl.to("#{c}i",{{opacity:0,duration:0.2,ease:"power2.in"}},{t1 - 0.22:.2f});')

def STEP(t0, t1, num, text):
    c = uid("st")
    items.append(clip(c, t0, t1, "", f'<span class="step" id="{c}i"><b>{num}</b>{text}</span>', 9))
    T(f'tl.fromTo("#{c}i",{{opacity:0,y:30}},{{opacity:1,y:0,duration:0.45,ease:"expo.out"}},{t0 + 0.05:.2f});')
    T(f'tl.to("#{c}i",{{opacity:0,duration:0.2,ease:"power2.in"}},{t1 - 0.22:.2f});')

def SCENE(t0, t1, inner, cls="mg", z=5):
    """Full-frame motion-graphics scene; inner elements are animated on the root timeline."""
    s = uid("s")
    items.append(clip(s, t0, t1, cls, inner, z))
    return s

def pop(sel, at, scale=0.6, dur=0.55):
    T(f'tl.fromTo("{sel}",{{opacity:0,scale:{scale}}},{{opacity:1,scale:1,duration:{dur},ease:"back.out(1.6)"}},{at:.2f});')
def rise(sel, at, y=40, dur=0.5):
    T(f'tl.fromTo("{sel}",{{opacity:0,y:{y}}},{{opacity:1,y:0,duration:{dur},ease:"expo.out"}},{at:.2f});')
def blurin(sel, at, dur=0.3):
    T(f'tl.fromTo("{sel}",{{opacity:0,filter:"blur(10px)"}},{{opacity:1,filter:"blur(0px)",duration:{dur},ease:"power4.out"}},{at:.2f});')
def count(eid, a, b, at, dur):
    T(f'(()=>{{const o={{v:{a}}};tl.fromTo(o,{{v:{a}}},{{v:{b},duration:{dur},ease:"power2.inOut",onUpdate:()=>{{document.getElementById("{eid}").textContent=Math.round(o.v)+"%";}}}},{at});}})();')
def words(text, at, gap=0.08, cls="w"):
    """Per-word blur-in title; returns html."""
    out = []
    for i, wd in enumerate(text.split(" ")):
        wid = uid("wd")
        out.append(f'<span class="{cls}" id="{wid}">{wd}</span>')
        blurin(f"#{wid}", at + i * gap, 0.18)
    return " ".join(out)

# ---------- icons (simple line icons) ----------
ICON = {
    "check": '<path d="M5 13l4 4L19 7"/>',
    "x": '<path d="M6 6l12 12M18 6L6 18"/>',
    "heart": '<path d="M12 21s-7.5-4.6-9.5-9.2C1 8.2 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 6 3.7 4.5 7.3C19.5 16.4 12 21 12 21z"/>',
    "brain": '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    "hourglass": '<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/>',
    "drop": '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    "moon": '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    "bolt": '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    "walk": '<circle cx="13" cy="4" r="2"/><path d="M10 21l2-6 3 3v3M8 12l3-4 4 2 2 3M12 8l-1 7"/>',
    "dumbbell": '<path d="M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12"/>',
    "users": '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 14.5c3 0 6 2 6 5.5"/>',
    "egg": '<path d="M12 3c3.5 0 6.5 6 6.5 10a6.5 6.5 0 0 1-13 0C5.5 9 8.5 3 12 3z"/>',
    "candy": '<circle cx="12" cy="12" r="4"/><path d="M8 12L3 9v6zM16 12l5-3v6z"/>',
    "chair": '<path d="M7 3v10h10M7 13v8M17 13v8M17 9V3"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "thumb": '<path d="M7 11v10H3V11zM7 11l4-8c1.5 0 2.5 1 2.5 2.5V9h5.5a2 2 0 0 1 2 2.3l-1.3 7.5a2 2 0 0 1-2 1.7H7"/>',
    "share": '<path d="M14 5l7 7-7 7v-4c-5 0-8 1.5-11 5 1-6 4-10 11-11z"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "phone": '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    "tablet": '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M11 18h2"/>',
    "laptop": '<rect x="5" y="4" width="14" height="10" rx="1"/><path d="M2 18h20"/>',
    "down": '<path d="M12 4v16M5 13l7 7 7-7"/>',
    "up": '<path d="M12 20V4M5 11l7-7 7 7"/>',
    "tap": '<path d="M9 11V5a2 2 0 0 1 4 0v5l4.5 1a2 2 0 0 1 1.5 2.3L18 19a3 3 0 0 1-3 2.5h-3.5a3 3 0 0 1-2.4-1.2L5 15a1.7 1.7 0 0 1 2.6-2.1L9 14"/>',
    "bed": '<path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6M7 11.5a1.5 1.5 0 1 0 0-.1"/>',
}
def ic(name, size=64, color="currentColor", sw=2.2):
    return f'<svg class="ic" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICON[name]}</svg>'

def figure(fid, scale=1.0):
    """Articulated 2D senior figure (lines with round caps). Limbs are set per frame by JS pose functions."""
    parts = "".join(f'<line id="{fid}{p}" stroke-linecap="round"/>' for p in ["sh", "th", "to", "ua", "fa", "ft"])
    return f'<g id="{fid}" class="fig">{parts}<circle id="{fid}hd" r="34"/><path id="{fid}hair" d=""/></g>'

# =====================================================================
# HOOK 0 - 27.9
# =====================================================================
V(0.00, 1.40, "mirror_1", 1.0, move=({"scale": 1.12}, {"scale": 1.0}))
s = SCENE(0.00, 1.40, '<div class="shade"></div><div class="stop" id="stopT">STOP<span id="stopBar"></span></div>', cls="mg clear")
T('tl.fromTo("#stopT",{scale:2.4,opacity:0},{scale:1,opacity:1,duration:0.32,ease:"power4.out"},0.02);')
T('tl.fromTo("#stopBar",{scaleX:0},{scaleX:1,duration:0.35,ease:"expo.out"},0.3);')
V(1.40, 5.04, "tv_7", 10)
CUE(3.44, 5.0, "Every single day")
V(5.04, 8.40, "sofa_5", 2)
CUE(5.9, 8.35, 'Quietly making you <em>age faster</em>')
V(8.40, 11.00, "think_3", 2)

h = (f'<div class="mgTitle" style="top:120px">{words("7 everyday habits that steal your…", 11.6)}</div>'
     '<div class="meters">' +
     "".join(f'<div class="meter" id="mt{i}"><div class="mlab">{ic(icn, 58, Y)}<span>{lab}</span></div><div class="mbar"><div class="mfill" id="mf{i}"></div></div><div class="mpct" id="mp{i}">100%</div></div>'
             for i, (lab, icn) in enumerate([("Strength", "dumbbell"), ("Balance", "walk"), ("Energy", "bolt")])) + '</div>')
SCENE(11.00, 17.32, h)
for i, at in enumerate([14.52, 15.40, 16.34]):
    rise(f"#mt{i}", 12.4 + i * 0.12, 30)
    T(f'tl.fromTo("#mf{i}",{{scaleX:1,backgroundColor:"#3ecf7a"}},{{scaleX:{[0.34, 0.42, 0.28][i]},backgroundColor:"{R}",duration:1.1,ease:"power2.inOut"}},{at:.2f});')
    count(f"mp{i}", 100, [34, 42, 28][i], at, 1.1)

V(17.32, 20.30, "couple_2", 1)
V(20.30, 22.60, "grandpa_4", 1)
CUE(18.56, 22.5, 'Easy to fix · <em>starting today</em>')

tiles = "".join(f'<div class="tile" id="tl{i}"><span>{i}</span></div>' for i in range(1, 7)) + '<div class="tile seven" id="tl7"><span>7</span><i id="q7">?</i></div>'
SCENE(22.60, 27.92, f'<div class="tiles">{tiles}</div><div class="mgSub" id="t7s">Habit #7 surprises almost everyone</div>')
for i in range(1, 8):
    pop(f"#tl{i}", 22.7 + i * 0.09, 0.5, 0.5)
T('tl.to("#tl7",{scale:1.28,duration:0.6,ease:"expo.out"},24.4);')
T('tl.to(".tile:not(.seven)",{opacity:0.35,duration:0.5},24.4);')
pop("#q7", 25.06, 0.3)
rise("#t7s", 25.5)

# =====================================================================
# EBOOK PROMO 27.9 - 127.3
# =====================================================================
V(27.92, 30.40, "tablet_5", 1)
V(30.40, 32.99, "read_2", 1)
CUE(28.82, 32.9, "Help keep these videos <em>free</em>")

covers = ["muscle", "strong21", "mealprep", "strong28"]
fan = "".join(f'<img class="fanc" id="fc{i}" src="assets/covers/{c}.png" alt="{c}">' for i, c in enumerate(covers))
chips = "".join(f'<span class="chip" id="ch{i}">{t}</span>' for i, t in enumerate(["Simple", "High quality", "Very cheap"]))
SCENE(32.99, 39.28, f'<div class="fan">{fan}</div><div class="chips">{chips}</div>')
for i in range(4):
    T(f'tl.fromTo("#fc{i}",{{opacity:0,y:300,rotation:0}},{{opacity:1,y:{[30, 0, 0, 30][i]},rotation:{[-12, -4, 4, 12][i]},duration:0.8,ease:"expo.out"}},{33.1 + i * 0.15:.2f});')
for i, at in enumerate([33.63, 34.55, 38.13]):
    pop(f"#ch{i}", at)

SCENE(39.28, 47.46, '<img id="pcov" src="assets/covers/muscle.png" alt="Muscle Building for Over 50">'
      '<div class="pbox"><div class="pname" id="pn">Muscle Building<br>Guide for Over 50</div>'
      '<div class="old" id="po">$15<span id="pstrike"></span></div><div class="new" id="pnw">$6.99</div><div class="off" id="poff">53% OFF</div></div>')
T('tl.fromTo("#pcov",{opacity:0,x:-200,rotation:-8},{opacity:1,x:0,rotation:-4,duration:0.9,ease:"expo.out"},39.35);')
T('tl.fromTo("#pcov",{scale:1},{scale:1.05,duration:8,ease:"none"},39.35);')
rise("#pn", 39.6)
pop("#po", 41.7, 0.7)
T('tl.fromTo("#pstrike",{scaleX:0},{scaleX:1,duration:0.35,ease:"power3.out"},43.1);')
T('tl.to("#po",{opacity:0.45,duration:0.3},43.3);')
T('tl.fromTo("#pnw",{opacity:0,scale:2.2},{opacity:1,scale:1,duration:0.4,ease:"power4.out"},44.6);')
pop("#poff", 45.6, 0.4)

V(47.46, 51.31, "phone_2", 2)
CUE(47.5, 51.2, "Here's how to get one")

# Step 1: link in the description (generic video page, no platform branding)
SCENE(51.31, 55.61, '<div class="yt"><div class="ytv"><img src="assets/covers/muscle.png" alt=""><div class="ytplay"></div></div>'
      '<div class="ytd" id="ytd"><b>Description</b><i></i><i style="width:70%"></i><span class="link" id="lk1">seniorfit-shop.fourthwall.com</span></div>'
      '<div class="ytd" id="ytc"><b>Pinned comment</b><span class="link" id="lk2">seniorfit-shop.fourthwall.com</span></div></div>'
      f'<div class="tap" id="tap">{ic("tap", 120, "#fff", 1.6)}</div>')
rise("#ytd", 51.5)
rise("#ytc", 53.9)
T('tl.fromTo("#lk1",{backgroundColor:"rgba(255,210,31,0)"},{backgroundColor:"rgba(255,210,31,1)",duration:0.3},52.3);')
T('tl.fromTo("#tap",{opacity:0,x:200,y:200},{opacity:1,x:0,y:0,duration:0.6,ease:"expo.out"},52.0);')
T('tl.to("#tap",{scale:0.85,duration:0.12,yoyo:true,repeat:1},52.7);')
T('tl.to("#tap",{y:200,duration:0.5,ease:"power2.inOut"},54.0);')
T('tl.fromTo("#lk2",{backgroundColor:"rgba(255,210,31,0)"},{backgroundColor:"rgba(255,210,31,1)",duration:0.3},54.3);')
STEP(51.31, 55.61, 1, "Tap the link in the description")

# Shop card: browser-like frame with a clean address bar (no personal tabs)
items.append(clip("card", 55.61, 112.89, "", '<div class="cardbar"><span class="dot"></span>seniorfit-shop.fourthwall.com</div>', 4))
DEMO = [("shop", 55.61, 59.03), ("click", 74.94, 78.74), ("cart", 92.59, 96.59), ("email", 96.59, 103.29), ("country", 103.29, 106.19), ("pay", 106.19, 109.99), ("order", 109.99, 112.89)]
for name, a, b in DEMO:
    items.append(f'<video id="d_{name}" class="clip demo" src="assets/demo/{name}.mp4" muted playsinline data-start="{a:.2f}" data-duration="{b - a:.2f}" data-track-index="6" style="z-index:6"></video>')
STEP(55.71, 59.03, 2, "The Senior Fit Shop opens")

# Covers named one by one
row = "".join(f'<div class="rc" id="rc{i}"><img src="assets/covers/{c}.png" alt="{c}"><span>{lab}</span></div>'
              for i, (c, lab) in enumerate(zip(covers, ["Muscle Building<br>for Over 50", "Senior Strong<br>21-Day Plan", "Meal Prep<br>50 Recipes", "Senior Strong<br>28-Day Plan"])))
SCENE(59.03, 74.94, f'<div class="rowc">{row}</div>', cls="mg inCard", z=6)
for i in range(4):
    rise(f"#rc{i}", 59.1 + i * 0.1, 60)
for i, at in enumerate([60.15, 62.63, 67.27, 71.35]):
    T(f'tl.to(".rc",{{opacity:0.4,scale:0.94,duration:0.35,ease:"power2.out"}},{at:.2f});')
    T(f'tl.to("#rc{i}",{{opacity:1,scale:1.1,duration:0.45,ease:"expo.out"}},{at:.2f});')
T('tl.to(".rc",{opacity:1,scale:1,duration:0.4},73.9);')
T('tl.fromTo(".rowc",{scale:1},{scale:1.05,duration:15.9,ease:"none"},59.03);')
STEP(74.94, 78.74, 3, "Tap the ebook you like")

# What's inside: product page with callouts
inside = ["15 step-by-step exercises", "Two 4-week workout plans", "7-day high-protein meal plan", "Printable progress logs", "No gym · just a chair &amp; a band"]
lst = "".join(f'<div class="inrow" id="in{i}">{ic("check", 46, G, 3)}<span>{t}</span></div>' for i, t in enumerate(inside))
SCENE(78.74, 92.59, f'<div class="pzoom" id="pz"><img src="assets/demo/product.png" alt="Product page"></div><div class="inside"><div class="inh">What\'s inside</div>{lst}</div>', cls="mg inCard", z=6)
T('tl.fromTo("#pz",{scale:1},{scale:1.22,duration:13.8,ease:"power1.inOut"},78.74);')
for i, at in enumerate([78.9, 81.76, 83.98, 86.68, 89.12]):
    T(f'tl.fromTo("#in{i}",{{opacity:0,x:60}},{{opacity:1,x:0,duration:0.45,ease:"expo.out"}},{at:.2f});')
STEP(92.59, 96.59, 4, "Add to Cart, then Checkout")
STEP(96.59, 103.29, 5, "Type your email address")
SCENE(98.5, 103.2, f'<div class="note" id="mailnote">{ic("mail", 54, INK)}<span>Your ebook is sent here!</span></div>', cls="mg clear", z=8)
pop("#mailnote", 98.55)
STEP(103.29, 106.19, 6, "Choose country &amp; zip code")
STEP(106.19, 109.99, 7, "Pay by card or PayPal")
STEP(109.99, 112.89, 8, "Tap Complete Order")

# The ebook arrives
dev = "".join(f'<div class="dev" id="dv{i}">{ic(k, 120, "#fff", 1.5)}<span>{t}</span></div>' for i, (k, t) in enumerate([("phone", "Phone"), ("tablet", "Tablet"), ("laptop", "Computer")]))
SCENE(112.89, 119.95, f'<div class="mgTitle" style="top:90px">{words("That is it!", 112.95, 0.12)}</div>'
      f'<div class="inbox" id="ibx"><div class="ibh">{ic("mail", 44, G)} Inbox</div><div class="mailrow" id="mrow"><img src="assets/covers/muscle.png" alt=""><div><b>Your ebook is here</b><i></i></div><em>NEW</em></div></div>'
      f'<div class="devs">{dev}</div>')
rise("#ibx", 113.4)
T('tl.fromTo("#mrow",{opacity:0,x:-500},{opacity:1,x:0,duration:0.7,ease:"expo.out"},114.0);')
for i, at in enumerate([117.31, 118.25, 118.91]):
    pop(f"#dv{i}", at)

V(119.95, 123.09, "read_5", 1)
CUE(120.1, 123.0, "Every purchase helps this channel")
V(123.09, 125.75, "smile_7", 1)
CUE(123.2, 125.7, "Thank you <em>so much</em>")
SCENE(125.75, 127.27, f'<div class="big" id="lb">Let\'s begin</div>')
T('tl.fromTo("#lb",{opacity:0,scale:0.7,filter:"blur(14px)"},{opacity:1,scale:1,filter:"blur(0px)",duration:0.45,ease:"expo.out"},125.8);')

# =====================================================================
# HABITS
# =====================================================================
def HT(t0, t1, num, title, plate, off=1.0, img=False, tag=None):
    """Habit title card over a darkened footage plate."""
    if img:
        w = uid("w")
        items.append(clip(w, t0, t1, "frame", f'<img class="full" src="assets/img/{plate}.jpg" alt="">', 1))
        T(f'tl.fromTo("#{w}",{{scale:1.1}},{{scale:1.0,duration:{t1 - t0:.2f},ease:"none"}},{t0:.2f});')
    else:
        V(t0, t1, plate, off, move=({"scale": 1.12}, {"scale": 1.0}))
    h = uid("h")
    tagh = f'<div class="htag" id="{h}g">{tag}</div>' if tag else ""
    SCENE(t0, t1, f'<div class="shade2"></div>{tagh}<div class="hnum" id="{h}n"><small>HABIT</small>{num}</div><div class="htitle" id="{h}t">{words(title, t0 + 0.75, 0.09, "w")}</div><div class="hbar" id="{h}b"></div>', cls="mg clear")
    T(f'tl.fromTo("#{h}n",{{opacity:0,scale:2,rotation:-8}},{{opacity:1,scale:1,rotation:0,duration:0.5,ease:"power4.out"}},{t0 + 0.15:.2f});')
    T(f'tl.fromTo("#{h}b",{{scaleX:0}},{{scaleX:1,duration:0.6,ease:"expo.out"}},{t0 + 0.6:.2f});')
    if tag:
        pop(f"#{h}g", t0 + 1.2)

# ---- 1 Sitting
HT(127.27, 130.89, 1, "Sitting for hours", "sofa_2", 2)
V(130.89, 135.53, "tv_2", 5)
CUE(131.0, 135.45, "After 60, unused muscles <em>shrink faster</em>")

legs = ('<svg class="legsvg" viewBox="0 0 600 760">'
        '<defs><linearGradient id="skin" x1="0" x2="1"><stop offset="0" stop-color="#f3cba8"/><stop offset="1" stop-color="#d9a37c"/></linearGradient>'
        '<linearGradient id="musc" x1="0" x2="1"><stop offset="0" stop-color="#ff6b6b"/><stop offset="1" stop-color="#c0392b"/></linearGradient></defs>'
        '<path d="M135 225 C128 320 150 400 168 440 C150 500 160 600 195 700 L188 738 L264 738 L250 700 C272 600 282 500 262 440 C285 380 296 300 290 225 Z" fill="url(#skin)" stroke="#8a5a3c" stroke-width="5"/><path d="M 465 225 C 472 320 450 400 432 440 C 450 500 440 600 405 700 L 412 738 L 336 738 L 350 700 C 328 600 318 500 338 440 C 315 380 304 300 310 225 Z" fill="url(#skin)" stroke="#8a5a3c" stroke-width="5"/>'
        '<g id="muscleL" class="musc"><path d="M150 245 C145 320 165 390 186 428 L246 428 C266 380 280 320 276 245 Z" fill="url(#musc)"/><path d="M165 255 C158 320 168 380 192 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M183 255 C176 320 184 380 202 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M201 255 C194 320 200 380 212 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M219 255 C212 320 216 380 222 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M237 255 C230 320 232 380 232 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M255 255 C248 320 248 380 242 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/></g><g id="muscleR" class="musc"><path d="M 450 245 C 455 320 435 390 414 428 L 354 428 C 334 380 320 320 324 245 Z" fill="url(#musc)"/><path d="M 435 255 C 442 320 432 380 408 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M 417 255 C 424 320 416 380 398 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M 399 255 C 406 320 400 380 388 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M 381 255 C 388 320 384 380 378 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M 363 255 C 370 320 368 380 368 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/><path d="M 345 255 C 352 320 352 380 358 420" stroke="#8e1f1f" stroke-width="3" fill="none" opacity="0.45"/></g>'
        '<ellipse cx="215" cy="440" rx="34" ry="22" fill="#e6b48f" stroke="#8a5a3c" stroke-width="4"/><ellipse cx="385" cy="440" rx="34" ry="22" fill="#e6b48f" stroke="#8a5a3c" stroke-width="4"/>'
        '<path class="blood" d="M215 455 C205 550 210 640 222 700"/><path class="blood" d="M 385 455 C 395 550 390 640 378 700"/>'
        '<path d="M118 30 H482 L474 238 H316 L300 130 L284 238 H126 Z" fill="#2f7dd1" stroke="#1f5d9e" stroke-width="5" stroke-linejoin="round"/></svg>')
labs = "".join(f'<div class="lrow" id="lg{i}">{ic("down", 54, R, 3)}<span>{t}</span></div>' for i, t in enumerate(["Weaker legs", "Stiffer hips", "Slower blood flow"]))
SCENE(135.53, 142.0, f'<div class="mgTitle left" style="top:90px">{words("Hours in a chair…", 135.6)}</div>{legs}<div class="musclePct"><b id="mpc">100%</b><span>thigh muscle</span></div><div class="lrows">{labs}</div>')
T('tl.fromTo(".musc",{scaleX:1,transformOrigin:"50% 50%"},{scaleX:0.62,duration:4.5,ease:"power2.inOut"},136.4);')
count("mpc", 100, 62, 136.4, 4.5)
T('tl.fromTo(".blood",{strokeDashoffset:0},{strokeDashoffset:-260,duration:6.4,ease:"power2.out"},135.6);')
for i, at in enumerate([136.53, 138.53, 139.99]):
    T(f'tl.fromTo("#lg{i}",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.45,ease:"expo.out"}},{at:.2f});')

SCENE(142.0, 146.98, '<div class="clockw"><svg viewBox="0 0 400 400" class="clocksvg"><circle cx="200" cy="200" r="170" class="ring"/>'
      '<circle cx="200" cy="200" r="170" class="ringp" id="ringp"/><line x1="200" y1="200" x2="200" y2="70" class="hand" id="hand"/><circle cx="200" cy="200" r="12" fill="#ffd21f"/></svg></div>'
      '<div class="cright"><div class="ctop" id="ct1">Every</div><div class="cbig" id="ct2">30–60 min</div><div class="cstand" id="ct3">STAND UP</div></div>'
      '<svg class="figbox" viewBox="0 40 400 400" id="fbox1"><rect x="30" y="312" width="150" height="16" rx="6" fill="#8b5e3c"/><rect x="30" y="170" width="16" height="150" rx="6" fill="#8b5e3c"/><rect x="44" y="326" width="12" height="74" fill="#6d4a2f"/><rect x="160" y="326" width="12" height="74" fill="#6d4a2f"/>'
      f'{figure("f1")}<line x1="0" y1="400" x2="400" y2="400" stroke="#ffffff55" stroke-width="4"/></svg>')
T('tl.fromTo("#ringp",{strokeDashoffset:1068},{strokeDashoffset:0,duration:3.4,ease:"power1.inOut"},142.1);')
T('tl.fromTo("#hand",{rotation:0,svgOrigin:"200 200"},{rotation:360,svgOrigin:"200 200",duration:3.4,ease:"power1.inOut"},142.1);')
rise("#ct1", 142.2)
rise("#ct2", 143.6)
T('tl.fromTo("#ct3",{opacity:0,scale:2},{opacity:1,scale:1,duration:0.4,ease:"power4.out"},145.2);')
T('tl.fromTo(F1,{p:0},{p:1,duration:1.2,ease:"power2.inOut",onUpdate:()=>sitStand("f1",F1.p,190,400)},145.5);')
V(146.98, 148.52, "kitchen_3", 3)
CUE(147.0, 148.5, "Walk to the kitchen")
V(148.52, 151.09, "march_3", 1)
CUE(148.6, 151.0, "March in place · <em>1 minute</em>")
V(151.09, 155.31, "park_6", 2)
CUE(151.2, 155.2, "Small moves, done often")

# ---- 2 Protein
HT(155.31, 158.79, 2, "Too little protein", "meal_2", 6)
SCENE(158.79, 164.45, '<div class="mgTitle" style="top:80px">A typical day…</div>'
      '<div class="pol" id="pl1"><img src="assets/img/toast_4.jpg" alt="Toast"><span>Toast</span></div>'
      '<div class="pol" id="pl2"><img src="assets/img/soup_4.jpg" alt="Soup"><span>Soup</span></div>'
      '<div class="gauge" id="gg"><div class="glab">Protein</div><div class="gbar"><div class="gfill" id="gf"></div></div><div class="glow" id="glw">LOW</div></div>', cls="mg cream")
T('tl.fromTo("#pl1",{opacity:0,y:-500,rotation:-20},{opacity:1,y:0,rotation:-6,duration:0.7,ease:"expo.out"},159.8);')
T('tl.fromTo("#pl2",{opacity:0,y:-500,rotation:20},{opacity:1,y:0,rotation:5,duration:0.7,ease:"expo.out"},161.6);')
rise("#gg", 162.8)
T('tl.fromTo("#gf",{scaleX:0},{scaleX:0.2,duration:0.8,ease:"power2.out"},163.0);')
pop("#glw", 163.6)

bricks = "".join(f'<div class="brick" id="bk{i}" style="left:{(i % 4) * 150 + (75 if (i // 4) % 2 else 0)}px;bottom:{(i // 4) * 80}px">PROTEIN</div>' for i in range(16))
SCENE(164.45, 169.27, f'<div class="mgTitle" style="top:90px">{words("Protein = muscle building blocks", 164.5)}</div><div class="wall" data-layout-ignore>{bricks}</div><div class="musclab" id="ml">{ic("dumbbell", 70, Y)} Holds on to muscle</div>')
for i in range(16):
    T(f'tl.fromTo("#bk{i}",{{opacity:0,y:-300}},{{opacity:1,y:0,duration:0.4,ease:"bounce.out"}},{165.0 + i * 0.16:.2f});')
rise("#ml", 167.9)

foods = [("egg_2", "Egg"), ("yogurt_7", "Yogurt"), ("beans_2", "Beans"), ("fish_4", "Fish"), ("chicken_7", "Chicken")]
fc = "".join(f'<div class="food" id="fd{i}"><img src="assets/img/{f}.jpg" alt="{t}"><span>{t}</span></div>' for i, (f, t) in enumerate(foods))
SCENE(169.27, 175.11, f'<div class="mgTitle" style="top:110px">Add one to <em>every meal</em></div><div class="foods">{fc}</div>', cls="mg cream")
for i, at in enumerate([169.27, 170.47, 171.29, 172.27, 173.13]):
    T(f'tl.fromTo("#fd{i}",{{opacity:0,y:120,scale:0.7}},{{opacity:1,y:0,scale:1,duration:0.6,ease:"back.out(1.5)"}},{at:.2f});')
V(175.11, 177.29, "meal_4", 2)
CUE(175.2, 177.2, "Your muscles will thank you")

# ---- 3 Water
HT(177.29, 180.96, 3, "Not enough water", "drink_1", 6)
def gauge(gid, label):
    return (f'<div class="tg"><svg viewBox="0 0 300 190"><path d="M30 170 A120 120 0 0 1 270 170" class="garc"/><path d="M30 170 A120 120 0 0 1 270 170" class="garcf" id="{gid}a"/>'
            f'<line x1="150" y1="170" x2="150" y2="70" class="needle" id="{gid}n"/><circle cx="150" cy="170" r="10" fill="#fff"/></svg><b>{label}</b></div>')
SCENE(180.96, 184.63, f'<div class="mgTitle" style="top:110px">{words("Your thirst signal weakens", 181.0)}</div><div class="gauges">{gauge("ga", "Age 30")}{gauge("gb", "Age 70")}</div>'
      f'<div class="thl">{ic("drop", 48, "#7fd3ff")}<span>thirst signal</span></div>')
T('tl.fromTo("#gan",{rotation:-80,svgOrigin:"150 170"},{rotation:60,svgOrigin:"150 170",duration:0.9,ease:"back.out(1.4)"},181.4);')
T('tl.fromTo("#gbn",{rotation:-80,svgOrigin:"150 170"},{rotation:-50,svgOrigin:"150 170",duration:0.9,ease:"back.out(1.4)"},182.3);')
T('tl.fromTo("#gaa",{strokeDashoffset:377},{strokeDashoffset:60,duration:0.9,ease:"power2.out"},181.4);')
T('tl.fromTo("#gba",{strokeDashoffset:377},{strokeDashoffset:300,duration:0.9,ease:"power2.out"},182.3);')
V(184.63, 188.06, "tired_0", 3)
CUE(184.7, 188.0, "Dehydrated, but <em>not thirsty</em>")
sym = "".join(f'<div class="sym" id="sy{i}">{t}</div>' for i, t in enumerate(["Tiredness", "Confusion", "Dizziness", "Falls"]))
SCENE(188.06, 192.96, '<svg class="glass" viewBox="0 0 300 420"><defs><clipPath id="gcl"><path d="M40 20 L260 20 L230 400 L70 400 Z"/></clipPath></defs>'
      '<g clip-path="url(#gcl)"><rect id="water" x="0" y="80" width="300" height="340" fill="#4fb6ec"/><rect id="water2" x="0" y="80" width="300" height="18" fill="#9bdcff"/></g>'
      '<path d="M40 20 L260 20 L230 400 L70 400 Z" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/></svg>'
      f'<div class="syms"><div class="symh">Low water can cause</div>{sym}</div>')
T('tl.fromTo("#water,#water2",{y:0},{y:270,duration:4.6,ease:"power1.in"},188.1);')
for i, at in enumerate([188.68, 189.74, 190.82, 191.74]):
    T(f'tl.fromTo("#sy{i}",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.4,ease:"expo.out"}},{at:.2f});')
V(192.96, 195.6, "drink_3", 2)
V(195.6, 197.80, "counter_0", 2)
CUE(193.0, 197.7, "Keep water in sight · <em>sip all day</em>")

# ---- 4 Strength
HT(197.80, 201.30, 4, "Only walking", "park_0", 4)
V(201.30, 206.90, "garden_4", 0.5)
SCENE(202.0, 206.85, f'<div class="badge ok" id="bw">{ic("check", 54, "#fff", 3)} Walking is wonderful</div><div class="badge warn" id="bn">But not enough <em>on its own</em></div>', cls="mg clear", z=8)
rise("#bw", 202.0)
rise("#bn", 204.4)
SCENE(206.90, 211.52, '<div class="mgTitle" style="top:70px">Leg strength with age</div><svg class="chart" viewBox="0 0 1400 600">'
      '<line x1="100" y1="520" x2="1340" y2="520" class="axis"/><line x1="100" y1="40" x2="100" y2="520" class="axis"/>'
      '<text x="100" y="575" class="tick">60</text><text x="700" y="575" class="tick">70</text><text x="1290" y="575" class="tick">80</text>'
      '<path id="lnA" d="M100 120 C400 140 700 160 1300 200" class="lineA"/><path id="lnB" d="M100 120 C400 230 700 340 1300 470" class="lineB"/>'
      '<text x="1000" y="160" class="labA" id="laA">Walking + strength work</text><text x="640" y="430" class="labB" id="laB">Walking only</text></svg>'
      f'<div class="cnote" id="cn1">{ic("down", 44, R, 3)} Weaker legs</div><div class="cnote" id="cn2" style="left:900px">{ic("down", 44, R, 3)} Balance fades</div>', cls="mg cream")
T('tl.fromTo("#lnA,#lnB",{strokeDasharray:1400,strokeDashoffset:1400},{strokeDashoffset:0,duration:2.4,ease:"power2.inOut"},207.2);')
rise("#laA", 208.8)
rise("#laB", 208.9)
rise("#cn1", 208.4)
rise("#cn2", 209.96)
V(211.52, 214.22, "balance_4", 2)
CUE(211.6, 214.15, "Strong legs = <em>independence</em>")
moves = ('<div class="moves">' +
         "".join(f'<div class="mv" id="mv{i}"><svg viewBox="0 40 400 400">{extra}{figure(f"m{i}")}<line x1="0" y1="400" x2="400" y2="400" stroke="#0b5a3a44" stroke-width="4"/></svg><span>{t}</span></div>'
                 for i, (t, extra) in enumerate([
                     ("Sit to stand", '<rect x="30" y="312" width="150" height="16" rx="6" fill="#8b5e3c"/><rect x="30" y="170" width="16" height="150" rx="6" fill="#8b5e3c"/><rect x="44" y="326" width="12" height="74" fill="#6d4a2f"/><rect x="160" y="326" width="12" height="74" fill="#6d4a2f"/>'),
                     ("Heel raises", '<rect x="280" y="238" width="120" height="162" rx="8" fill="#c9a27a"/><rect x="270" y="226" width="140" height="18" rx="6" fill="#8b5e3c"/>'),
                     ("Resistance band", '<rect x="360" y="110" width="14" height="290" rx="4" fill="#8b5e3c"/><path id="band2" d="" stroke="#2ecc71" stroke-width="10" fill="none" stroke-linecap="round"/>')])) + '</div>')
SCENE(214.22, 219.82, f'<div class="mgTitle" style="top:70px">{words("Simple strength moves", 214.3)}</div>{moves}', cls="mg cream")
for i, at in enumerate([214.22, 216.42, 218.28]):
    rise(f"#mv{i}", 214.3 + i * 0.12, 60)
    T(f'tl.fromTo("#mv{i}",{{borderColor:"rgba(11,90,58,0)"}},{{borderColor:"rgba(255,210,31,1)",duration:0.3}},{at:.2f});')
T('tl.fromTo(M0,{p:0},{p:1,duration:0.9,ease:"sine.inOut",repeat:5,yoyo:true,onUpdate:()=>sitStand("m0",M0.p,190,400)},214.4);')
T('tl.fromTo(M1,{p:0},{p:1,duration:0.6,ease:"sine.inOut",repeat:7,yoyo:true,onUpdate:()=>heelRaise("m1",M1.p,200,400)},214.4);')
T('tl.fromTo(M2,{p:0},{p:1,duration:0.7,ease:"sine.inOut",repeat:7,yoyo:true,onUpdate:()=>bandPull("m2",M2.p,180,400)},214.4);')
items.append(clip("pinwrap", 219.82, 221.82, "frame", '<div class="pinbg"></div>', 1))
items.append('<div class="pincard" style="z-index:2"><video id="pinv" class="clip" src="assets/stock/pin_seniorex_8.mp4" muted playsinline data-start="219.82" data-duration="2.00" data-media-start="3" data-track-index="2"></video></div>')
T('tl.fromTo(".pincard",{scale:0.92,rotation:-2},{scale:1,rotation:0,duration:2,ease:"none"},219.82);')
V(221.82, 223.82, "band_1", 1)
week = "".join(f'<div class="day" id="dy{i}"><span>{d}</span><i></i></div>' for i, d in enumerate(["M", "T", "W", "T", "F", "S", "S"]))
SCENE(219.9, 223.78, f'<div class="weekbox" id="wk"><div class="wkh">2–3 times a week</div><div class="week">{week}</div></div>', cls="mg clear", z=8)
rise("#wk", 219.95)
for i, at in [(0, 220.6), (2, 221.0), (4, 221.4)]:
    T(f'tl.fromTo("#dy{i} i",{{scale:0}},{{scale:1,duration:0.35,ease:"back.out(2)"}},{at:.2f});')
    T(f'tl.to("#dy{i}",{{backgroundColor:"{Y}",color:"{INK}",duration:0.2}},{at:.2f});')
V(223.82, 226.26, "doctor_1", 16)
CUE(223.85, 226.2, "Check with your doctor first")

# ---- 5 Sleep
HT(226.26, 229.38, 5, "Poor sleep", "sleep_2", 10)
V(229.38, 231.66, "tv_7", 60)
CUE(229.45, 231.6, "Late-night TV")
V(231.66, 232.98, "bed_0", 1)
CUE(231.7, 232.95, "Phones in bed")
V(232.98, 235.78, "nap_0", 4)
CUE(233.0, 235.7, "Long afternoon naps")
stars = "".join(f'<i class="star" id="sr{i}" style="left:{(i * 397) % 1840 + 40}px;top:{(i * 211) % 420 + 30}px"></i>' for i in range(26))
SCENE(235.78, 239.52, f'<div class="night">{stars}</div><div class="moon" id="mn">{ic("moon", 200, Y, 1.4)}</div>'
      '<svg class="hyp" viewBox="0 0 1500 360"><path id="hp" d="M0 60 H140 V160 H260 V290 H420 V160 H520 V60 H640 V160 H760 V290 H960 V160 H1060 V60 H1200 V160 H1300 V290 H1500" class="hypl"/>'
      '<rect x="260" y="270" width="160" height="40" class="deep" id="dp1"/><rect x="760" y="270" width="200" height="40" class="deep" id="dp2"/><rect x="1300" y="270" width="200" height="40" class="deep" id="dp3"/></svg>'
      '<div class="deeplab" id="dl">Deep sleep = <em>body repair</em></div>')
for i in range(26):
    T(f'tl.fromTo("#sr{i}",{{opacity:0.15}},{{opacity:1,duration:{0.6 + (i % 5) * 0.2:.1f},yoyo:true,repeat:3,ease:"sine.inOut"}},{235.8 + (i % 7) * 0.1:.2f});')
T('tl.fromTo("#mn",{opacity:0,y:60},{opacity:1,y:0,duration:0.8,ease:"expo.out"},235.85);')
T('tl.fromTo("#hp",{strokeDasharray:3400,strokeDashoffset:3400},{strokeDashoffset:0,duration:2.6,ease:"none"},236.0);')
T('tl.fromTo(".deep",{opacity:0},{opacity:1,duration:0.4,stagger:0.5},236.6);')
rise("#dl", 236.6)
V(239.52, 246.95, "sleep_5", 0)
tips = "".join(f'<div class="tip" id="tp{i}">{ic(k, 50, Y)}<span>{t}</span></div>' for i, (k, t) in enumerate([("clock", "Same bedtime &amp; wake time"), ("moon", "Dark, cool bedroom"), ("bed", "Keep naps short")]))
SCENE(239.6, 246.9, f'<div class="tips"><div class="tiph">Better sleep</div>{tips}</div>', cls="mg clear", z=8)
rise(".tiph", 239.6)
for i, at in enumerate([239.6, 242.74, 244.98]):
    T(f'tl.fromTo("#tp{i}",{{opacity:0,x:-60}},{{opacity:1,x:0,duration:0.45,ease:"expo.out"}},{at:.2f});')

# ---- 6 Sugar
HT(246.95, 250.03, 6, "Too much sugar", "sweets_4", img=True)
junk = [("sweets_4", "Sweets"), ("bread_0", "White bread"), ("ready_4", "Ready meals")]
jc = "".join(f'<div class="pol j" id="jk{i}"><img src="assets/img/{f}.jpg" alt="{t}"><span>{t}</span></div>' for i, (f, t) in enumerate(junk))
SCENE(250.03, 253.87, f'<div class="jrow">{jc}</div>', cls="mg cream")
for i, at in enumerate([251.15, 251.97, 252.89]):
    T(f'tl.fromTo("#jk{i}",{{opacity:0,y:300,rotation:{[-14, 0, 14][i]}}},{{opacity:1,y:0,rotation:{[-5, 1, 6][i]},duration:0.55,ease:"expo.out"}},{at - 0.4:.2f});')
SCENE(253.87, 259.25, '<div class="mgTitle left" style="top:70px">Blood sugar</div><svg class="chart" viewBox="0 0 1400 600" style="top:190px;left:60px;width:1180px;height:506px">'
      '<line x1="60" y1="520" x2="1340" y2="520" class="axis"/><line x1="60" y1="300" x2="1340" y2="300" class="safe"/>'
      '<path id="gl" d="M60 420 C140 420 170 120 230 110 S330 420 420 420 C520 420 540 90 610 80 S720 420 800 420 C890 420 920 130 980 120 S1090 420 1180 420 L1340 420" class="lineB"/>'
      '<text x="200" y="80" class="labB" id="sp1">Spike!</text><text x="580" y="50" class="labB" id="sp2">Spike!</text><text x="950" y="90" class="labB" id="sp3">Spike!</text></svg>'
      f'<div class="harm"><div class="hm" id="hm1">{ic("heart", 80, R)}<span>Harms your heart</span></div><div class="hm" id="hm2">{ic("bolt", 80, "#999")}<span>Leaves you tired</span></div></div>', cls="mg cream")
T('tl.fromTo("#gl",{strokeDasharray:2600,strokeDashoffset:2600},{strokeDashoffset:0,duration:3.2,ease:"none"},254.0);')
for i, at in enumerate([254.55, 255.5, 256.4]):
    pop(f"#sp{i + 1}", at)
rise("#hm1", 256.6)
T('tl.fromTo("#hm1 .ic",{scale:1},{scale:1.18,duration:0.3,yoyo:true,repeat:3,ease:"sine.inOut"},256.7);')
rise("#hm2", 257.8)
swap = [("fruitp_1", "Fruit"), ("nuts_1", "Nuts"), ("veg_4", "Vegetables")]
sw = "".join(f'<div class="food" id="sw{i}"><img src="assets/img/{f}.jpg" alt="{t}"><span>{t}</span></div>' for i, (f, t) in enumerate(swap))
SCENE(259.25, 264.05, f'<div class="mgTitle" style="top:90px">{words("Swap one snack a day", 259.3)}</div>'
      f'<div class="swapL" id="swl"><img src="assets/img/sweets_4.jpg" alt="Packaged snack"><span>Packaged snack</span><b id="swx">{ic("x", 150, R, 3)}</b></div>'
      f'<div class="arrowR" id="arw">→</div><div class="foods small">{sw}</div>', cls="mg cream")
rise("#swl", 259.4)
pop("#swx", 260.3)
rise("#arw", 260.8)
for i, at in enumerate([261.49, 262.23, 262.93]):
    T(f'tl.fromTo("#sw{i}",{{opacity:0,scale:0.6}},{{opacity:1,scale:1,duration:0.5,ease:"back.out(1.6)"}},{at:.2f});')
V(264.05, 266.11, "fruit_0", 6)
CUE(264.1, 266.05, "Little swaps add up")

# ---- 7 Loneliness (the surprise)
HT(266.11, 270.41, 7, "Too much time alone", "lonely_2", 2, tag="The surprise")
V(270.41, 272.79, "lonely_1", 1)
risks = "".join(f'<div class="risk" id="rk{i}">{ic(k, 64, "#fff")}<span>{t}</span></div>' for i, (k, t) in enumerate([("heart", "Heart disease"), ("brain", "Memory decline"), ("hourglass", "Shorter life")]))
dots = "".join(f'<i class="pd" id="pd{i}" style="left:{c[0]}px;top:{c[1]}px"></i>' for i, c in enumerate([(300, 260), (520, 180), (470, 470), (190, 470), (650, 340)]))
SCENE(272.79, 278.17, f'<div class="mgTitle left" style="top:90px">Loneliness is linked to…</div><div class="net"><svg viewBox="0 0 800 700" class="netl"><line x1="330" y1="290" x2="550" y2="210" id="nl0"/><line x1="550" y1="210" x2="680" y2="370" id="nl1"/><line x1="500" y1="500" x2="680" y2="370" id="nl2"/><line x1="220" y1="500" x2="500" y2="500" id="nl3"/></svg>{dots}<i class="me" id="me"></i></div><div class="risks">{risks}</div>', cls="mg dark")
T('tl.fromTo(".pd",{opacity:0,scale:0},{opacity:1,scale:1,duration:0.4,stagger:0.08,ease:"back.out(2)"},272.85);')
T('tl.fromTo(".netl line",{opacity:0},{opacity:1,duration:0.3,stagger:0.08},273.0);')
T('tl.fromTo("#me",{opacity:0,x:0},{opacity:1,x:0,duration:0.3},273.0);')
T('tl.to("#me",{x:420,y:-40,duration:1.6,ease:"power2.inOut"},273.4);')
T('tl.to("#me",{backgroundColor:"#888",duration:1.0},274.4);')
for i, at in enumerate([273.57, 275.47, 276.29]):
    T(f'tl.fromTo("#rk{i}",{{opacity:0,x:80}},{{opacity:1,x:0,duration:0.45,ease:"expo.out"}},{at:.2f});')
V(278.17, 279.53, "call_3", 2)
CUE(278.2, 279.5, "Call a friend")
V(279.53, 281.11, "group_6", 2)
CUE(279.55, 281.05, "Join a walking group")
V(281.11, 282.61, "visit_3", 3)
CUE(281.15, 282.55, "Visit a neighbour")
V(282.61, 285.0, "laugh_1", 2)
V(285.0, 287.25, "laugh_2", 2)
CUE(282.7, 287.15, "Good company is <em>good medicine</em>")

# =====================================================================
# REVIEW + CLOSE
# =====================================================================
rev = [("walk", "Move often", 288.95), ("egg", "Eat more protein", 290.37), ("drop", "Drink water", 292.03), ("dumbbell", "Build strength", 293.25),
       ("moon", "Sleep well", 294.61), ("candy", "Cut the sugar", 295.87), ("users", "Stay connected", 297.09)]
rr = "".join(f'<div class="rv" id="rv{i}"><span class="rvi">{ic(k, 50, G)}</span><span class="rvt">{t}</span><span class="rvc" id="rc_{i}">{ic("check", 46, "#fff", 3.5)}</span></div>' for i, (k, t, _) in enumerate(rev))
SCENE(287.25, 298.69, f'<div class="mgTitle" style="top:60px">{words("Let\'s review", 287.3)}</div><div class="rvl">{rr}</div>', cls="mg cream")
for i, (_, _, at) in enumerate(rev):
    T(f'tl.fromTo("#rv{i}",{{opacity:0}},{{opacity:0.3,duration:0.3}},{287.6 + i * 0.07:.2f});')
    T(f'tl.to("#rv{i}",{{opacity:1,duration:0.3}},{at:.2f});')
    T(f'tl.fromTo("#rc_{i}",{{scale:0}},{{scale:1,duration:0.4,ease:"back.out(2.2)"}},{at:.2f});')
V(298.69, 300.80, "smile_5", 2)
CUE(298.75, 300.75, "Start with just <em>one</em> today")

ec = "".join(f'<img class="ecv" id="ec{i}" src="assets/covers/{c}.png" alt="{c}">' for i, c in enumerate(covers))
SCENE(300.80, 312.10, f'<div class="mgTitle" style="top:70px">{words("Want a simple plan to follow?", 301.0)}</div><div class="ecs">{ec}</div>'
      f'<div class="elink" id="el">{ic("down", 54, INK, 3)} Link in the description</div><div class="echips"><span class="chip" id="e1">Cheap</span><span class="chip" id="e2">Easy to follow</span><span class="chip" id="e3">Keeps this channel alive</span></div>')
for i in range(4):
    T(f'tl.fromTo("#ec{i}",{{opacity:0,y:200,rotation:{[-6, -2, 2, 6][i]}}},{{opacity:1,y:0,rotation:{[-3, -1, 1, 3][i]},duration:0.7,ease:"expo.out"}},{302.6 + i * 0.12:.2f});')
T('tl.fromTo(".ecs",{scale:1},{scale:1.05,duration:9,ease:"none"},302.6);')
pop("#el", 305.4)
T('tl.fromTo("#el .ic",{y:-8},{y:8,duration:0.4,yoyo:true,repeat:9,ease:"sine.inOut"},305.8);')
for i, at in enumerate([307.02, 308.14, 309.56]):
    pop(f"#e{i + 1}", at)
V(312.10, 316.14, "wave_0", 1)
SCENE(312.12, 316.1, f'<div class="sbtn" id="lkb">{ic("thumb", 70, "#fff")}<span>Like</span></div><div class="sbtn" id="shb" style="left:auto;right:140px">{ic("share", 70, "#fff")}<span>Share with a friend</span></div>', cls="mg clear", z=8)
pop("#lkb", 312.15)
T('tl.to("#lkb",{backgroundColor:"#1f8bff",scale:1.1,duration:0.2,yoyo:true,repeat:1},312.9);')
pop("#shb", 313.72)
V(316.14, DUR, "sunset_7", 2)
SCENE(316.9, DUR, '<div class="endline" id="tc">Take care of yourself</div>', cls="mg clear", z=8)
blurin("#tc", 316.95, 0.4)

# ---------- sound ----------
audio = [f'<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="318.66" data-volume="1" data-track-index="10"></audio>']
for i, st in enumerate(()):  # music removed at the user's request (2026-11-08)
    d = min(174.9, DUR - st)
    audio.append(f'<audio id="m{i}" class="clip" src="assets/music/bed.wav" data-start="{st}" data-duration="{d:.2f}" data-volume="0.09" data-fade-in="0.5" data-fade-out="2.0" data-track-index="11"></audio>')

CSS = open(HERE / "style.css", encoding="utf-8").read()
POSE = open(HERE / "pose.js", encoding="utf-8").read()
html = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
{CSS}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1920" data-height="1080">
{chr(10).join(items)}
{chr(10).join(audio)}
</div>
<script>
{POSE}
const tl = gsap.timeline({{paused:true}});
const F1={{p:0}}, M0={{p:0}}, M1={{p:0}}, M2={{p:0}};
sitStand("f1",0,190,400); sitStand("m0",0,190,400); heelRaise("m1",0,200,400); bandPull("m2",0,180,400);
{chr(10).join(tw)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(HERE / "index.html").write_text(html, encoding="utf-8")
print("written", len(items), "elements,", len(tw), "tweens")
