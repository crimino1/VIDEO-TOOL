"""Bit by Bit EP2: How to Actually Get Good at Coding. Writes parts/p1..p4.html and sfx.json.
Voice public/vo.mp3 (545.72 s). Pixel scenes: assets/js/scenes/*.js on engine v2 assets/js/px.js; stock in stock/raw."""
import json, sys
from lib import *

END = 545.72
CSS = open(H / "style.css", encoding="utf-8").read()
SCENES = sorted(p.name for p in (H / "assets" / "js" / "scenes").glob("*.js"))


def R(word, after=0.0, plus=0.0, end=False):
    """Absolute word time (+plus) marked for conversion to shot-relative inside pixel options."""
    return A(W(word, after, end) + plus)


def _fx(fx, a):
    for name, t, *v in fx:
        tt = a + float(t[1:]) if isinstance(t, str) and t.startswith("+") else s(t)
        sfx(name, tt, v[0] if v else 1.0, v[1] if len(v) > 1 else None)


def P(kind, ov=None, fx=(), **o):
    """Pixel shot (+ optional DOM overlay). fx = [(name, time or "+rel", vol), ...]."""
    o.setdefault("tin", "zoom"); o.setdefault("tout", "zoom")
    def f(a, b):
        pxshot(a, b, kind, o)
        if ov: layer(a, b, ov(a, b))
        _fx(fx, a)
    return f


def L(*ovs, fx=()):
    """Overlay-only shot over the starfield."""
    def f(a, b):
        layer(a, b, "".join(o(a, b) for o in ovs))
        _fx(fx, a)
    return f


def M(poses, side="left", sub_=None, extra=None, h=640, fx=()):
    """Mascot shot. poses = [(t or None for shot start, pose)], sub_ = [(head, [body], t or None, end)], extra = overlay fn."""
    def f(a, b):
        ps = [(a if t is None else t, p) for t, p in poses]
        x = 600 if side == "left" else 140
        subs = "".join(sub(hd, bd, x, 380 if len(bd) < 2 else 330, a if t is None else t, e) for hd, bd, t, e in (sub_ or []))
        layer(a, b, mascot(a, b, ps, side, h) + subs + (extra(a, b) if extra else ""))
        _fx(fx, a)
    return f


def PH(name, ov=None, fx=(), **kw_):
    def f(a, b):
        layer(a, b, photo(a, b, name, **kw_) + (ov(a, b) if ov else ""))
        _fx(fx, a)
    return f


def SS(name, crop, hl=None, ov=None, fx=(("whoosh", "-0.05", 0.5),), **kw_):
    def f(a, b):
        h_ = None
        if hl: h_ = (s(hl[0]),) + tuple(hl[1:])
        layer(a, b, shot_ss(a, b, name, crop, hl=h_, **kw_) + (ov(a, b) if ov else ""))
        _fx([(n, a - 0.05 if t == "-0.05" else t, *v) for n, t, *v in fx], a)
    return f


SEC = lambda l1, l2: L(lambda a, b: sec(l1, l2, a))
K = lambda text, t=None, **k: (lambda a, b: kwl(text, a if t is None else t, **k))
KW = lambda words, **k: (lambda a, b: kw(words, **k))
OV = lambda *fs: (lambda a, b: "".join(f(a, b) for f in fs))
C = {"cyan": "#5fe3e8", "yel": "#f7c948", "pur": "#8a5cf6", "pink": "#f25ca8", "grn": "#3df56b", "org": "#f08a3c"}

def V(src, ss=0.0, ov=None, fx=(), **k):
    """Stock / screen-recording shot (stock/raw/<src>.mp4) with optional DOM overlay."""
    def f(a, b):
        video(a, b, src, ss, **k)
        if ov: layer(a, b, ov(a, b))
        _fx(fx, a)
    return f


def SECP(l1, l2, fx=()):
    """Section card over the synthwave backdrop scene."""
    def f(a, b):
        pxshot(a, b, "secbg", {"tin": "glitch", "tout": "zoom", "cam": {"z": [1.0, 1.04]}})
        layer(a, b, sec(l1, l2, a))
        _fx(fx, a)
    return f


CAM_IN = lambda z0=1.0, z1=1.18, x=320, y=180: {"z": [z0, z1], "x": [320, x], "y": [180, y]}
MON = {"z": [1.0, 1.7], "x": [320, 320], "y": [180, 152], "e": "io"}     # push into the room's monitor

SHOTS = [
    # ===================== COLD OPEN =====================
    ("0:00.00", V("pxb_161739", 1.0, zoom=(1.0, 1.08), ov=OV(K("Want to get good at coding?", 0.0, y=760, size=92, end=W("Easy")), K("Easy.", W("Easy"), y=760, size=110)))),
    ("0:02.48", P("keeb", tin="glitch", fx=[("glitch", 2.45, 0.6), ("type", 2.6, 0.9, 3.0)])),
    ("0:05.70", P("room", mode="setup", cam=CAM_IN(1.18, 1.0, 320, 180), fx=[("whoosh", 5.7, 0.6)])),
    (W("install", 5.7), P("neovim", days=[R("spend", 8), R("weekend", 8), R("configuring", 8)], done=R("watch", 12, -0.5), fx=[("type", W("install", 5.7) + 0.2, 0.6, 1.6), ("notif", W("watch", 12) - 0.5, 0.6)])),
    (W("watch", 12), P("tutorials", fx=[("click", W("watch", 12) + 0.4, 0.7), ("pop", W("two", 14), 0.6)])),
    ("0:17.44", P("room", mode="setup", cam={"z": [1.25, 1.0]}, ov=K("An incredible setup.", W("incredible"), y=80, size=84))),
    ("0:20.72", P("room", cam=MON, ov=K("And no idea how to build anything.", W("absolutely"), y=80, size=76), fx=[("glitch", 20.7, 0.5)])),
    ("0:24.08", M([(None, "shrug"), (W("only", 25.9), "point")], "right", sub_=[("Okay, I'm kidding.", [], None, W("only", 25.9)), ("Only a little.", ["That's what most", "people actually do."], W("only", 25.9), None)])),
    ("0:29.28", P("room", quiet=R("quiet", 33), cam={"z": [1.0, 1.55], "x": [320, 320], "y": [180, 158]}, tin="fade", fx=[("pop", W("quiet", 33), 0.5)])),
    # ===================== INTRO =====================
    ("0:37.14", P("logo2", done=1.4, tin="glitch", fx=[("glitch", 37.1, 0.6), ("impact", 38.4, 0.6)])),
    ("0:39.36", P("two_paths", labels=1.0, reveal=R("not", 43), fx=[("pop", 40.4, 0.5), ("whoosh", W("not", 43), 0.5)])),
    ("0:50.30", P("quit_curve", q=R("quit", 53), cam=CAM_IN(1.0, 1.15, 380, 150), fx=[("impact", W("quit", 53), 0.5)])),
    # ===================== PART 1: THE TUTORIAL TRAP =====================
    ("0:57.96", SECP("Part 1:", "The tutorial trap")),
    ("1:01.46", V("pxb_65401", 0.5, zoom=(1.0, 1.1), ov=K("Every line makes sense.", W("every", 61), y=820, size=80, cls="dark"))),
    ("1:08.60", P("gauge", wrong=R("wrong", 70), fx=[("notif", W("wrong", 70), 0.6)])),
    ("1:12.46", P("recog", labels=R("Recognizing", 75), tags=R("tutorial", 80.5), ov=K("The fluency illusion", W("fluency"), y=60, size=80, end=W("Recognizing", 75)),
                  fx=[("pop", W("Recognizing", 75), 0.5), ("pop", W("tutorial", 80.5), 0.5)])),
    ("1:25.18", P("test", close=R("close", 87), blank=R("open", 87), peek=R("No", 93.5), timer=R("stuck", 94.8), flag=R("learning", 98.5),
                  fx=[("click", W("close", 87), 0.7), ("pop", W("No", 93.5), 0.5), ("impact", W("learning", 98.5), 0.45)])),
    # ===================== RULE 1 =====================
    ("1:42.40", SECP("Rule 1:", "Build before you feel ready")),
    ("1:46.84", P("waiting")),
    ("1:50.74", P("goldilocks", at=[R("Too", 113), R("Too", 116), R("want", 118.9)], fx=[("pop", W("Too", 113), 0.5), ("impact", W("Too", 116), 0.5), ("pop", W("want", 118.9), 0.5)])),
    (W("80", 118.9, -0.3), P("eighty", grow=R("growth", 125.6), fx=[("notif", W("growth", 125.6), 0.5)])),
    ("2:08.84", P("projects_ladder", at=[R("script", 131), R("scraper", 135), R("multiplayer", 140), R("Git", 145)], climb=R("climb", 151),
                  fx=[("pop", W("script", 131), 0.5), ("pop", W("scraper", 135), 0.5), ("pop", W("multiplayer", 140), 0.5), ("pop", W("Git", 145), 0.5)])),
    # ===================== RULE 2 =====================
    ("2:34.04", SECP("Rule 2:", "Practice the parts you're bad at")),
    ("2:35.94", V("pxb_123762", 2.0, zoom=(1.0, 1.08))),
    ("2:40.06", P("academy", cam=CAM_IN(1.0, 1.12, 320, 170), ov=OV(K("Anders Ericsson", W("Anders"), y=820, size=84)))),
    ("2:51.02", P("practice_rooms", focus=R("top", 176), fx=[("whoosh", W("top", 176), 0.4)])),
    ("3:03.62", P("sheet_music", loop=R("Finding", 189), clean=R("clean", 193), ov=K("Deliberate practice", W("deliberate", 183), y=50, size=80, end=W("Finding", 189)), fx=[("notif", W("clean", 193), 0.5)])),
    ("3:14.50", P("recursion", ov=K("Scared of recursion?", W("recursion", 196), y=60, size=72))),
    ("3:21.86", P("sql50", fx=[("type", 202.3, 0.5, 2.0)])),
    ("3:27.48", P("target", hit=1.0, fx=[("whoosh", 208.1, 0.5), ("impact", 208.5, 0.5)])),
    ("3:30.36", P("todo_clones", q=R("progress", 218), fx=[("pop", W("progress", 218), 0.5)])),
    ("3:40.92", P("blueprint_build", title=R("build", 225), fx=[("whoosh", W("build", 225), 0.4)])),
    ("3:50.28", P("diy_bench", at=[R("hash", 230), R("regex", 231), R("interpreter", 232), R("web", 236)], worse=R("worse", 240),
                  fx=[("pop", W("hash", 230), 0.45), ("pop", W("regex", 231), 0.45), ("pop", W("interpreter", 232), 0.45), ("pop", W("web", 236), 0.45)])),
    ("4:06.66", P("dict_xray", xray=R("dictionary", 246), fx=[("whoosh", W("dictionary", 246), 0.4)])),
    # ===================== RULE 3 =====================
    ("4:13.72", SECP("Rule 3:", "Read more code than you write")),
    ("4:17.58", V("pxb_140593", 0.5, zoom=(1.0, 1.08))),
    ("4:21.16", P("room", typing=0.0, cam=CAM_IN(1.05, 1.2, 320, 200), ov=K("Learning only by typing?", W("learn", 261), y=70, size=76), fx=[("type", 261.3, 0.6, 2.6)])),
    ("4:24.50", V("rec_requests_repo", 0.0, zoom=(1.0, 1.03), ov=K("A small library you actually use", W("small", 264.5), y=880, size=64, cls="dark"))),
    ("4:32.54", V("rec_requests_api", 0.0, zoom=(1.0, 1.04))),
    ("4:38.20", P("clean_code", fx=[("pop", 279.5, 0.4)])),
    ("4:44.78", P("time_machine", back=R("three", 287), cringe=R("cringe", 290.6), yay=R("congratulations", 290.6), still=R("perfect", 296),
                  fx=[("whoosh", W("three", 287), 0.5), ("pop", W("congratulations", 290.6), 0.5)])),
    # ===================== RULE 4 =====================
    ("5:00.14", SECP("Rule 4:", "Struggle before you ask the AI")),
    ("5:07.22", P("paste_loop", drain=R("learning", 314), rewire=R("struggle", 315.7), fx=[("click", 308.2, 0.5), ("click", 309.4, 0.5), ("notif", 312.6, 0.4)])),
    ("5:19.74", P("think_vs_real")),
    ("5:25.78", P("stacktrace", timer=0.3, trace=R("Read", 330), scan=R("answer", 334), found=R("exact", 338), fx=[("click", 326.3, 0.5), ("notif", W("exact", 338), 0.5)])),
    ("5:40.30", P("prints", ok=R("test", 344), fx=[("pop", W("test", 344), 0.5)])),
    ("5:46.22", P("journal", months=R("months", 353), five=R("same", 357), fx=[("whoosh", W("months", 353), 0.4), ("pop", W("same", 357), 0.5)])),
    ("6:03.94", P("duck", say=99, oops=99, ov=K("Rubber duck debugging", W("duck", 366), y=60, size=76))),
    ("6:11.44", V("rec_duck_wiki", 0.0, zoom=(1.0, 1.04))),
    ("6:14.58", P("duck", say=R("this", 376), oops=R("realize", 379.5), fx=[("pop", W("realize", 379.5), 0.6)])),
    ("6:22.60", P("chat_explain", toggle=R("explain", 386), patch=R("patch", 396), fx=[("click", W("explain", 386), 0.6), ("pop", W("patch", 396), 0.5)])),
    # ===================== RULE 5 =====================
    ("6:39.76", SECP("Rule 5:", "Ship it to a real person")),
    ("6:43.78", P("recruiter", fx=[("whoosh", 405.5, 0.4)])),
    ("6:48.30", V("pxb_174003", 1.0, zoom=(1.0, 1.08), ov=K("Something one actual human uses.", W("Something", 408.3), y=840, size=72, cls="dark"))),
    ("6:50.98", P("tuition", fx=[("pop", 412.5, 0.4)])),
    ("6:55.70", P("bill", fx=[("notif", 418.0, 0.4)])),
    ("7:01.64", P("jenga", poke=R("touches", 421.6), fx=[("impact", W("touches", 421.6) + 0.4, 0.5)])),
    ("7:08.00", P("users_break", at=[0.2, R("back", 430.6), R("phone", 433.8)], fx=[("notif", 428.4, 0.45), ("notif", W("back", 430.6), 0.45), ("notif", W("phone", 433.8), 0.45)])),
    ("7:17.18", V("pxb_38084", 0.5, zoom=(1.0, 1.08), ov=OV(K("No tutorial teaches you that.", 437.18, y=780, size=72, end=W("Users", 439), cls="dark"), K("Users do.", W("Users", 439), y=780, size=100, cls="dark")))),
    ("7:20.90", P("level_up", lvl=R("before", 445), fx=[("notif", W("before", 445), 0.6)])),
    # ===================== LAST ONE =====================
    ("7:28.22", SECP("The last one:", "Feeling worse means you're better")),
    ("7:32.32", P("taste_gap", skill=0.5, taste=R("taste", 458.8), gap=99, climbers=99)),
    ("7:41.66", P("doubt", leave=R("quit", 469), opposite=R("opposite", 474), fx=[("impact", W("opposite", 474), 0.5)])),
    ("7:55.94", P("taste_gap", skill=-9, taste=-9, gap=R("gap", 476), climbers=R("Every", 482.5), fx=[("pop", W("gap", 476), 0.5)])),
    ("8:05.92", L(lambda a, b: photo(a, b, "norvig", w=1000, h=760, cx=1180, cy=540, crop=(0.18, 0.0, 0.88, 1.0)) + kwl("Peter Norvig", W("Peter"), x=110, y=380, size=92, align="left", maxw=700)
                  + kwl("led research at Google", W("led"), x=110, y=500, size=52, align="left", maxw=700) + '<div class="credit">Photo: Christopher Michel, CC BY-SA 4.0</div>')),
    (W("called", 490), V("rec_norvig", 0.0, zoom=(1.0, 1.04))),
    ("8:13.46", P("books_24h", stamp=R("promising", 493), fx=[("impact", W("promising", 493) + 0.3, 0.5)])),
    ("8:19.20", P("long_road", free=R("nobody", 504), cam=CAM_IN(1.0, 1.15, 320, 160))),
    # ===================== RECAP + END =====================
    ("8:27.92", P("recap", at=[R("Stop", 510), R("Build", 513.6), R("Practice", 516.5), R("Read", 518.8), R("Struggle", 521.3), R("put", 523.4)],
                  fx=[("pop", W("Stop", 510), 0.45), ("pop", W("Build", 513.6), 0.45), ("pop", W("Practice", 516.5), 0.45), ("pop", W("Read", 518.8), 0.45), ("pop", W("Struggle", 521.3), 0.45), ("pop", W("put", 523.4), 0.45)])),
    ("8:46.58", P("room", typing=R("typing", 532), cam={"z": [1.0, 1.5], "x": [320, 320], "y": [180, 160]}, fx=[("type", W("typing", 532), 0.7, 1.6)])),
    ("8:53.90", P("logo2", done=R("Bit", 536.5, 0.3), fx=[("glitch", 533.9, 0.5), ("impact", W("Bit", 536.5) + 0.3, 0.5)])),
    ("8:57.84", P("outro", press=R("subscribe", 538), comment=R("comments", 541), fx=[("click", W("subscribe", 538) + 0.2, 0.7), ("type", W("comments", 541), 0.4, 1.4)])),
]


PARTS = [0.0, s("2:34.04"), s("5:00.14"), s("7:28.22"), END]


def write_part(k):
    p0, p1 = PARTS[k], PARTS[k + 1]
    html.clear(); tl.clear(); sps.clear()
    ST["off"] = p0
    for i, (t, fn) in enumerate(SHOTS):
        a = s(t); b = s(SHOTS[i + 1][0]) if i + 1 < len(SHOTS) else END
        if b <= p0 + 0.01 or a >= p1 - 0.01: continue
        fn(max(a, p0), min(b, p1))
    dur = p1 - p0
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur:.3f}" data-width="1920" data-height="1080">
<svg width="0" height="0" style="position:absolute"><defs>
<filter id="bbRough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
<filter id="bbGlow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" result="b"/><feColorMatrix in="b" values="0 0 0 0 0.37  0 0 0 0 0.89  0 0 0 0 0.91  0 0 0 0.55 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs></svg>
<canvas id="stars" width="1920" height="1080" style="z-index:0"></canvas>
<canvas id="crt" width="1920" height="1080" style="z-index:1"></canvas>
{chr(10).join(html)}
</div>
<script>window.PXS = {json.dumps(sps)};</script>
<script src="assets/js/px.js"></script>
{chr(10).join(f'<script src="assets/js/scenes/{f}"></script>' for f in SCENES)}
<script>PX.start();</script>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {dur:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>
'''
    (H / "parts").mkdir(exist_ok=True)
    (H / "parts" / f"p{k + 1}.html").write_text(doc, encoding="utf-8")
    print(f"p{k + 1}.html  {p0:.2f}-{p1:.2f}  {len(html)} layers, {len(tl)} tweens, {len(sps)} pixel shots")


if __name__ == "__main__":
    for i in range(1, len(SHOTS)):
        assert s(SHOTS[i][0]) > s(SHOTS[i - 1][0]), f"shot order {SHOTS[i - 1][0]} -> {SHOTS[i][0]}"
    ks = [int(x) - 1 for x in sys.argv[1:]] or range(4)
    sfx_cues.clear()
    for k in ks: write_part(k)
    if len(ks) == 4:
        json.dump(sorted(sfx_cues), open(H / "sfx.json", "w"), indent=0)
        print(len(sfx_cues), "sound cues,", len(SHOTS), "shots")
