"""Bit by Bit EP1: Is a CS degree worth it in 2027? Writes parts/p1..p4.html and sfx.json.
Voice public/vo.mp3 (577.84 s). Pixel scenes: assets/js/scenes/*.js on the engine assets/js/px.js."""
import json, sys
from lib import *

END = 577.84
CSS = open(H / "style.css", encoding="utf-8").read()
SCENES = sorted(p.name for p in (H / "assets" / "js" / "scenes").glob("*.js"))


def R(word, after=0.0, plus=0.0, end=False):
    """Absolute word time (+plus) marked for conversion to shot-relative inside pixel options."""
    return A(W(word, after, end) + plus)


def _fx(fx, a):
    for name, t, *v in fx:
        tt = a + float(t[1:]) if isinstance(t, str) and t.startswith("+") else s(t)
        sfx(name, tt, v[0] if v else 1.0)


def P(kind, ov=None, fx=(), **o):
    """Pixel shot (+ optional DOM overlay). fx = [(name, time or "+rel", vol), ...]."""
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

SHOTS = [
    # ===================== COLD OPEN (sarcastic) =====================
    ("0:00.00", L(K("Starting a Computer Science degree in 2027?", 0.0, x=110, y=170, size=84, align="left", maxw=1700))),
    (W("2027"), P("calendar", flip=R("2027", 0, 0.15), bad=R("bad"), gin=0.12, fx=[("whoosh", W("2027") + 0.1, 0.6), ("boom", W("bad") + 0.05, 0.7)])),
    ("0:05.84", P("money", fx=[("coin", "+0.4", 0.5), ("coin", "+1.6", 0.4), ("coin", "+2.8", 0.4)])),
    (W("learning", 5.84), P("chatbot", ask=R("learning", 5.84, 0.3), done=R("seconds", 5.84), fx=[("type", W("learning", 5.84) + 0.3, 0.5), ("power", W("seconds", 5.84) + 0.1, 0.6)],
                            ov=K("11 seconds", W("11"), y=880, size=80))),
    ("0:13.66", P("race", win=R("faster", 13.66), fx=[("win", W("faster", 13.66) + 0.1, 0.5)])),
    ("0:16.86", PH("thinker", w=1000, h=640, cy=500, ov=K("Philosophy.", 16.86, y=850, size=110))),
    ("0:17.92", P("chair", fx=[("blip", "+0.3", 0.4), ("blip", "+1.2", 0.35), ("blip", "+2.1", 0.35)])),
    ("0:21.62", M([(None, "idle"), (W("smart", 21.6), "point")], "left", sub_=[("So do the", ["smart thing."], None, None)])),
    ("0:23.34", PH("plumber", w=1060, h=700, cx=1290, cy=540, ov=KW([("Drop out.", W("Drop")), ("\n", 0), ("Buy a wrench.", W("buy", 23.3)), ("\n", 0), ("Be a plumber.", W("become", 23.3))],
                                                                    x=70, y=330, size=78, align="left", maxw=820, lh=1.35))),
    (W("because", 23.34), P("robot_sink", err=R("sink", 23.34), fx=[("hurt", W("sink", 23.34) + 0.05, 0.6)])),
    ("0:30.40", P("warning", gin=0.15, fx=[("glitch", 30.35, 0.6), ("beeps", 30.6, 0.45)])),
    ("0:33.72", M([(None, "scratch"), ("0:35.90", "shrug")], "right", extra=KW([("I'm kidding.", W("kidding")), ("\n", 0), ("Mostly.", W("Mostly"))], x=120, y=360, size=96, align="left", maxw=1000, lh=1.5),
                  fx=[("glitch", 33.68, 0.5)])),
    ("0:36.92", M([(None, "think"), (W("checked"), "point")], "left", sub_=[("The numbers", ["behind the rant", "are real."], None, W("checked")), ("I checked.", [], W("checked"), None)])),
    ("0:41.94", P("feed", fx=[("blip", "+0.2", 0.35), ("blip", "+1.6", 0.3), ("blip", "+3.0", 0.3)])),
    (W("went", 41.94), P("sheet", cols=[{"h": "UNEMPLOYED", "vals": ["7.0%", "7.8%", "5.1%", "-"]}, {"h": "UNDEREMPLOYED", "vals": ["19%", "-", "47%", "39%"]}, {"h": "MEDIAN PAY", "vals": ["$87K", "-", "-", "$58K"]}], pan=R("columns", 41.94), target=1, fx=[("whoosh", W("columns", 41.94), 0.45)])),
    # ===================== INTRO =====================
    ("0:51.06", P("logo", done=1.1, fx=[("logo", 51.06, 0.7)])),
    ("0:52.82", P("shatter", at=R("apart", 52.82), fx=[("glitch", W("apart", 52.82), 0.5)])),
    ("0:56.68", P("two_students", right=R("20", 56.68), fx=[("pop", W("20", 56.68), 0.5)])),
    (W("decision", 56.68), M([(None, "shrug"), (W("headline", 60), "point")], "right", sub_=[("This deserves", ["more than", "a headline."], None, None)])),
    # ===================== PART 1: THE SCARY NUMBERS =====================
    ("1:05.18", SEC("Part 1:", "The scary numbers")),
    ("1:08.28", SS("ss_nyfed", (300, 150, 1300, 940), hl=(W("unemployment", 68.28), 0.19, 0.21, 0.93, 0.31), w=1100, h=820, cy=540)),
    ("1:12.76", P("bars", title="RECENT-GRAD UNEMPLOYMENT", fmt="%", dec=1, hi=0,
                  items=[{"label": "COMP SCI", "v": 7.0, "col": C["cyan"], "show": R("7", 72.76)}, {"label": "COMP ENG", "v": 7.8, "col": C["pur"], "show": R("7", W("engineering"))},
                         {"label": "PHILOSOPHY", "v": 5.1, "col": C["yel"], "show": R("5", 79.0)}],
                  fx=[("pop", W("7", 72.76), 0.5), ("pop", W("7", W("engineering")), 0.5), ("pop", W("5", 79.0), 0.5)])),
    ("1:21.82", M([(None, "shrug")], "right", extra=K("That part was true.", 81.82, x=120, y=420, size=92, align="left", maxw=1100))),
    ("1:24.96", P("students", drop=R("dropped", 84.96), label="CS MAJORS, ONE YEAR", fx=[("hurt", W("dropped", 84.96) + 0.1, 0.5)])),
    ("1:33.60", P("counter", v=53000, label=["FEWER STUDENTS", "IN ONE YEAR"], at=R("53", 93.6, -0.2), cd=1.4, fx=[("coin", W("53", 93.6), 0.5)])),
    ("1:39.48", M([(None, "scratch")], "left", sub_=[("And then", ["the one that", "actually worries me."], None, None)])),
    ("1:42.26", SS("ss_stanford", (140, 250, 1560, 1000), hl=(W("payroll", 102.2), 0.17, 0.66, 0.54, 0.99), w=1300, h=720)),
    (W("covering", 102.26), P("payroll", fx=[("blip", "+0.2", 0.35), ("blip", "+1.0", 0.3)])),
    ("1:47.36", P("lines", years=[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
                  series=[{"label": "DEVS AGED 22-25", "col": C["cyan"], "pts": [100, 104, 108, 116, 128, 118, 108, 102], "at": 0.4, "dd": round(float(W("20", 110)) - 107.36 - 0.4, 2)},
                          {"label": "OLDER WORKERS", "col": C["yel"], "pts": [100, 101, 102, 104, 105, 107, 109, 110], "at": R("older", 110), "dd": 3.0}],
                  notes=[{"i": 4, "label": "PEAK", "col": C["cyan"], "at": R("peak", 107.3)}, {"i": 7, "label": "-20%", "col": "#ff4d4d", "at": R("20", 110)},
                         {"i": 7, "label": "+6-9%", "col": C["yel"], "at": R("6", 116)}],
                  fx=[("pop", W("peak", 107.3), 0.4), ("hurt", W("20", 110), 0.45), ("pop", W("6", 116), 0.45)])),
    ("2:03.04", P("office", flip=R("stopped", 123), ov=K("Nobody is firing the seniors.", W("Nobody", 123), y=50, size=62), fx=[("blip", W("stopped", 123), 0.5)])),
    ("2:10.52", P("ladder", saw=R("soared", 130.5), jump=R("soared", 130.5, 1.4), fx=[("laser", W("soared", 130.5), 0.5), ("boom", W("soared", 130.5) + 0.6, 0.5)])),
    ("2:15.09", M([(None, "think")], "left", sub_=[("The theory:", ["why juniors?"], None, None)])),
    ("2:18.57", P("training", items=[{"label": "TEXTBOOKS", "at": R("Textbooks", 138.5)}, {"label": "DOCS", "at": R("documentation", 138.5)}, {"label": "FORUM ANSWERS", "at": R("forum", 138.5)}],
                  ov=K("Trained on what's written down", 138.57, y=40, size=58), fx=[("pop", W("Textbooks", 138.5), 0.4), ("pop", W("documentation", 138.5), 0.4), ("pop", W("forum", 138.5), 0.4)])),
    ("2:25.87", P("grad_books", eq=R("exactly", 145.8), fx=[("pop", W("exactly", 145.8), 0.5)])),
    ("2:30.07", P("prod2am", lesson=R("nobody", 152.8), ov=K("Breaking production at 2am", W("breaking", 150), y=40, size=58), fx=[("beeps", W("breaking", 150), 0.35), ("power", W("nobody", 152.8), 0.45)])),
    ("2:39.43", P("worldmap", us=R("US", 159.4), others=R("somewhere", 164), fx=[("blip", W("US", 159.4), 0.5), ("blip", W("somewhere", 164), 0.4)])),
    (W("treat", 168.49), P("warnsign", at=R("warning", 168.5), fx=[("pop", W("warning", 168.5), 0.5)])),
    ("2:55.45", P("laptop_close", close=R("Close", 175), fx=[("pop", W("Close", 175) + 0.2, 0.5), ("beeps", W("plumber", 176), 0.4)])),
    # ===================== PART 2: THE SECOND COLUMN =====================
    ("2:59.51", SEC("Part 2:", "The second column")),
    ("3:04.29", P("sheet", cols=[{"h": "UNEMPLOYED", "vals": ["7.0%", "7.8%", "5.1%", "-"]}, {"h": "UNDEREMPLOYED", "vals": ["19%", "-", "47%", "39%"]}, {"h": "MEDIAN PAY", "vals": ["$87K", "-", "-", "$58K"]}], pan=R("right", 184), target=1, fx=[("whoosh", W("right", 184), 0.45)])),
    ("3:10.97", L(K("A job that doesn't need a degree at all.", 190.97, y=420, size=88, maxw=1500))),
    ("3:15.47", PH("barista", w=1100, h=700, cy=470, ov=K("A barista with a bachelor's", W("barista"), y=880, size=78))),
    ("3:17.77", P("bars", title="UNDEREMPLOYED", fmt="%", hi=2, items=[{"label": "ALL MAJORS", "v": 39, "col": C["pur"], "show": R("39")},
                                                                         {"label": "PHILOSOPHY", "v": 47, "col": C["yel"], "show": R("47")}, {"label": "COMP SCI", "v": 19, "col": C["cyan"], "show": R("19", 203)}],
                  fx=[("pop", W("39"), 0.5), ("pop", W("47"), 0.5), ("pop", W("19", 203), 0.5)])),
    ("3:27.09", P("bars", title="EARLY-CAREER MEDIAN PAY", fmt="$k", items=[{"label": "COMP SCI", "v": 87, "col": C["cyan"], "show": R("87")}, {"label": "ALL MAJORS", "v": 58, "col": C["pur"], "show": R("58")}],
                  fx=[("coin", W("87"), 0.5), ("coin", W("58"), 0.45)])),
    ("3:37.43", P("median", mid=0.6, half=R("half", 217.4), fx=[("pop", 218.0, 0.4), ("pop", W("half", 217.4), 0.4)])),
    ("3:42.05", P("rank", at=0.3, hi=1, rows=[{"name": "COMP ENG", "v": "#1"}, {"name": "COMP SCI", "v": "$87K"}, {"name": "...", "v": ""}, {"name": "...", "v": ""}, {"name": "...", "v": ""}], fx=[("coin", W("second", 222), 0.5)])),
    ("3:47.77", P("compare", stats=[{"label": "OUT OF WORK", "a": "7.0%", "b": "5.1%", "av": 7.0, "bv": 5.1, "good": "low", "at": R("out", 229.7)},
                                    {"label": "JOB NEEDS DEGREE", "a": "81%", "b": "53%", "av": 81, "bv": 53, "good": "high", "at": R("needs", 233)},
                                    {"label": "PAY VS AVERAGE", "a": "+50%", "b": "?", "av": 50, "bv": 0, "good": "high", "at": R("pays", 236)}],
                  verdict=R("Almost", 241), fx=[("pop", W("out", 229.7), 0.4), ("pop", W("needs", 233), 0.4), ("coin", W("pays", 236), 0.45)])),
    ("4:08.13", M([(None, "think")], "left", sub_=[("My guess:", ["some CS grads", "are holding out."], None, None)])),
    ("4:12.65", PH("mall", w=1100, h=680, cy=470, ov=K("Paid 87K? Not the mall.", W("87k", 252), y=870, size=80))),
    ("4:17.45", M([(None, "shrug")], "right", extra=K("A guess, not proof.", 257.45, x=120, y=420, size=92, align="left", maxw=1100))),
    # ===================== PART 3: LOOKING FORWARD =====================
    ("4:21.05", SEC("Part 3:", "Looking forward")),
    ("4:22.57", SS("ss_bls_dev", (280, 400, 1320, 730), hl=(W("10", 262.57), 0.0, 0.76, 0.57, 0.88), w=1400, h=560)),
    ("4:27.73", P("projection", r1=0.3, open=R("106"), r2=R("separate", 276), down=99, fx=[("type", "+0.2", 0.4), ("coin", W("106"), 0.45), ("type", W("separate", 276), 0.4)])),
    ("4:40.33", P("design2code", fx=[("type", "+0.6", 0.4)])),
    ("4:45.33", SS("ss_bls_prog", (280, 400, 1320, 730), hl=(W("shrink"), 0.0, 0.76, 0.57, 0.88), w=1400, h=560)),
    ("4:48.65", P("projection", r1=-9, open=-9, r2=-9, down=0.3, fx=[("hurt", 289.0, 0.4)])),
    ("4:53.11", P("value", cheap=0.8, a=R("Deciding", 296), b=R("knowing", 296), fx=[("hurt", 293.9, 0.35), ("coin", W("Deciding", 296), 0.45), ("coin", W("knowing", 296), 0.45)])),
    ("5:02.87", P("thumb", at=1.4, fx=[("pop", 302.9, 0.4)])),
    ("5:05.49", P("suspects", at=[R("AI", 305.5), R("interest", 310), R("binge", 312)], none=R("Nobody", 315), fx=[("pop", W("AI", 305.5), 0.45), ("pop", W("interest", 310), 0.45), ("pop", W("binge", 312), 0.45), ("boom", W("Nobody", 315), 0.5)])),
    ("5:18.31", M([(None, "scratch")], "left", sub_=[("Be suspicious", ["of anyone who's sure.", "Including me."], None, None)])),
    # ===================== PART 4: WHAT ARE YOU BUYING =====================
    ("5:22.45", SEC("Part 4:", "What are you buying?")),
    ("5:24.45", P("shop", dead=R("no", 328), dead2=R("dead", 329), fx=[("boom", W("no", 328), 0.55), ("hurt", W("dead", 329), 0.4)])),
    ("5:31.51", P("oldpath", steps=[{"label": "SHOW UP", "at": R("show", 331.5)}, {"label": "PASS CLASSES", "at": R("pass", 331.5)}, {"label": "1 INTERNSHIP", "at": R("internship", 331.5)}, {"label": "OFFER", "at": R("collect", 331.5)}],
                  fx=[("pluck", W("show", 331.5), 0.5), ("pluck", W("pass", 331.5), 0.5), ("pluck", W("internship", 331.5), 0.5), ("win", W("collect", 331.5), 0.5)])),
    ("5:38.45", P("receipt", lines=[{"l": "CS DEGREE", "r": "X1", "at": 0.2}, {"l": "4 YEARS", "r": "", "at": 0.5}, {"l": "TUITION", "r": "$$$$$", "at": 0.8}, {"l": "LATE NIGHTS", "r": "MANY", "at": 1.1}, {"sep": True, "at": 1.3}, {"l": "TOTAL PAID", "r": "ok", "at": 1.5}],
                  empty=R("receipt", 338.4), fx=[("type", 338.6, 0.4), ("hurt", W("receipt", 338.4), 0.4), ("coin", W("paid", 343), 0.45)])),
    ("5:45.17", P("slots", at=[R("three", 345), R("three", 345, 0.6), R("three", 345, 1.2)], fx=[("power", W("three", 345), 0.4)])),
    ("5:48.17", P("fundamentals", at=[R("data", 348), R("operating", 348), R("networks", 348), R("database", 348)], row=R("row", 352),
                  fx=[("pop", W("data", 348), 0.4), ("pop", W("operating", 348), 0.4), ("pop", W("networks", 348), 0.4), ("pop", W("database", 348), 0.4)])),
    ("5:57.45", M([(None, "shrug"), (W("reverse"), "point")], "right", sub_=[("Useless now?", [], None, W("reverse")), ("The reverse.", [], W("reverse"), None)])),
    ("6:02.33", P("review", find=R("catch", 362), fx=[("type", 362.5, 0.35), ("hurt", W("catch", 362), 0.45)])),
    ("6:09.83", P("query", a=R("100", 369.8), b=R("falls", 369.8), fail=R("ones", 372, 0.4), fx=[("power", W("100", 369.8), 0.35), ("boom", W("ones", 372) + 0.4, 0.55)])),
    ("6:17.17", P("lecture", save=R("will", 379), fx=[("power", W("will", 379), 0.45)])),
    ("6:22.03", L(K("You can't review what you can't read.", 382.03, y=400, size=96, maxw=1500))),
    ("6:24.55", P("math", at=[R("Linear", 384.5), R("probability", 384.5), R("discrete", 384.5)], fx=[("pop", W("Linear", 384.5), 0.4), ("pop", W("probability", 384.5), 0.4), ("pop", W("discrete", 384.5), 0.4)])),
    ("6:29.47", P("stack", at=[0.3, 0.9, 1.5], ai=R("AI", 389.4), crack=R("weekend", 389.4), fx=[("boom", 389.8, 0.3), ("power", W("AI", 389.4), 0.45), ("hurt", W("weekend", 389.4), 0.45)])),
    ("6:37.29", PH("lecture", w=1100, h=680, cy=470, ov=K("It makes you sit through them.", W("makes", 397), y=870, size=76))),
    ("6:42.73", P("campus", fx=[("blip", 403.0, 0.35)])),
    (W("internships", 404), P("door", open=R("enrolled", 404), side=R("side", 413), fx=[("whoosh", W("enrolled", 404), 0.45), ("power", W("side", 413), 0.4)])),
    ("6:57.81", PH("selftaught", w=1100, h=680, cy=470, ov=K("Teaching yourself?", W("teaching", 417.8), y=870, size=84))),
    ("7:03.15", P("funnel", harsh=R("filters", 427), fx=[("blip", 423.5, 0.3), ("hurt", W("filters", 427), 0.4)])),
    ("7:14.43", SS("ss_bls_how", (280, 0, 1320, 420), hl=(W("bachelor", 434.4), 0.01, 0.2, 0.64, 0.37), w=1400, h=600)),
    ("7:20.65", P("difficulty", at=R("hard", 440.6), fx=[("blip", 441.0, 0.35), ("hurt", W("hard", 440.6), 0.45)])),
    ("7:24.83", P("coast", stop=R("coast", 444.8), fx=[("boom", W("coast", 444.8), 0.5)])),
    # ===================== VERDICT =====================
    ("7:28.67", SEC("The verdict:", "Where I land")),
    ("7:30.81", P("checklist", title="DO IT IF...", items=[{"text": "IT INTERESTS YOU", "at": R("interesting", 450.8), "mark": "ok"}, {"text": "EVEN AT TEACHER PAY", "at": R("teaching", 450.8), "mark": "ok"}],
                  fx=[("coin", W("interesting", 450.8), 0.45), ("coin", W("teaching", 450.8), 0.45)])),
    ("7:35.17", M([(None, "tada")], "left", sub_=[("Need to know", ["WHY the code works?", "Good decade for you."], None, None)])),
    ("7:42.85", P("checklist", title="DO IT IF...", items=[{"text": "IT INTERESTS YOU", "at": -9, "mark": "ok"}, {"text": "EVEN AT TEACHER PAY", "at": -9, "mark": "ok"},
                                                            {"text": "IT WON'T WRECK YOU $", "at": R("without", 462.8), "mark": "ok"}], fx=[("coin", W("without", 462.8), 0.45)])),
    ("7:46.65", P("loans", a=R("20", 466.6), b=R("200", 466.6), fx=[("pop", W("20", 466.6), 0.45), ("boom", W("200", 466.6), 0.5)])),
    ("7:52.83", L(KW([("Cheap + solid", W("Cheap", 472.8)), ("\n", 0), ("beats", W("beats", 472.8)), ("\n", 0), ("famous + expensive", W("famous"))], y=300, size=104, lh=1.3))),
    ("7:57.65", P("safe", open=R("safe", 477.6), gone=R("gone", 480), fx=[("whoosh", W("safe", 477.6), 0.45), ("hurt", W("gone", 480), 0.4)])),
    ("8:05.71", P("profile", at=[R("nothing", 485.7), R("internship", 485.7), R("curiosity", 485.7)], fx=[("hurt", W("nothing", 485.7), 0.35), ("hurt", W("internship", 485.7), 0.35), ("hurt", W("curiosity", 485.7), 0.35)])),
    ("8:13.31", P("door_ai", at=R("AI", 493.3), fx=[("pop", W("AI", 493.3), 0.5)])),
    ("8:20.59", P("quest", items=[{"text": "BUILD SOMETHING REAL", "at": R("Build", 500.5), "done": 99}, {"text": "ONE INTERNSHIP", "at": 99, "done": 99}, {"text": "HARD MATH ELECTIVES", "at": 99, "done": 99}],
                  sub={"text": "TO-DO APP", "at": R("to", 505.5, -0.3), "strike": R("to", 505.5, 0.6), "end": 7.1}, fx=[("pop", W("Build", 500.5), 0.4), ("hurt", W("to", 505.5), 0.35)])),
    ("8:27.79", P("rename", complain=R("complain", 510), fx=[("type", 508.0, 0.35), ("beeps", W("complain", 510), 0.4)])),
    ("8:34.49", P("quest", items=[{"text": "BUILD SOMETHING REAL", "at": -9, "done": 0.2}, {"text": "ONE INTERNSHIP", "at": R("internship", 514.4), "done": R("internship", 514.4, 1.2)},
                                  {"text": "HARD MATH ELECTIVES", "at": R("math", 516), "done": R("math", 516, 1.2)}], sub=False,
                  fx=[("power", 514.7, 0.4), ("power", W("internship", 514.4) + 1.2, 0.4), ("win", W("math", 516) + 1.2, 0.5)])),
    ("8:41.53", L(KW([("Degree + proof you can ship", W("Degree", 521.5)), ("\n", 0), ("beats either one alone.", W("beats", 521.5))], y=380, size=92, lh=1.35))),
    ("8:45.55", P("queue", leave=R("money", 530), love=R("actually", 536), fx=[("blip", W("money", 530), 0.4), ("power", W("actually", 536), 0.4)])),
    ("9:03.11", L(K("Is a CS degree worth it in 2027?", 543.11, y=400, size=100, maxw=1500))),
    ("9:06.93", P("ticket", no=R("No", 547.5), yes=R("Yes", 549), only=R("train", 550), fx=[("hurt", W("No", 547.5), 0.5), ("power", W("Yes", 549), 0.5)])),
    ("9:12.37", PH("gym", w=1100, h=680, cy=470, ov=K("A gym membership you never use", W("gym", 552), y=870, size=74))),
    ("9:16.57", P("checker", ghost=R("replaced", 557), fx=[("glitch", W("replaced", 557), 0.45)])),
    ("9:22.13", P("logo", done=R("bit", 563, 0.5), fx=[("logo", W("bit", 563) - 0.2, 0.6)])),
    ("9:25.89", P("subscribe", press=R("subscribe", 567), comment=R("comments", 568), fx=[("coin", W("subscribe", 567) + 0.1, 0.5), ("type", W("comments", 568), 0.35)])),
]

PARTS = [0.0, s("2:59.51"), s("5:22.45"), s("7:28.67"), END]


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
