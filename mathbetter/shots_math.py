# EP4 shot list (exec'd in build.py's namespace). Documentary cut: chapter cards, place/year supers, people, real footage,
# then the pixel mechanism. Real files are optional: helpers fall back to pixel scenes when a file is missing.
IMG = H / "assets" / "img"
RAW = H / "stock" / "raw"
have_img = lambda n: any(IMG.glob(n + ".*"))
have_raw = lambda n: (RAW / (n + ".mp4")).exists()


def DIMP(kind, op=0.55, ov=None, fx=(), **o):
    """Pixel scene dimmed under an overlay (cards, refrains)."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
    def f(a, b):
        pxshot(a, b, kind, o)
        layer(a, b, scrim(op) + (ov(a, b) if ov else ""))
        _fx(fx, a)
    return f


def BG(spec, a, b):
    """Backdrop: ("v", clip, ss) real footage | ("p", kind, opts) pixel scene."""
    if spec[0] == "v" and have_raw(spec[1]):
        video(a, b, spec[1], spec[2], zoom=(1.0, 1.06), grade="eq=saturation=0.88:contrast=1.03:brightness=-0.02")
    else:
        k, o = (spec[1], dict(spec[2])) if spec[0] == "p" else (spec[3], dict(spec[4] if len(spec) > 4 else {}))
        o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
        pxshot(a, b, k, o)


def CHAP(no, title, bg, sci=None, credit_=None, ov=None, op=0.55):
    def f(a, b):
        BG(bg, a, b)
        layer(a, b, scrim(op) + chap(no, title, s(a) + 0.15, sci=sci) + (credit(credit_) if credit_ else "") + (ov(a, b) if ov else ""))
    return f


def REAL(clip, ss, fallback, ov=None, fx=(), cred=None, **k):
    """Real footage shot with a pixel fallback ("p", kind, opts) if the clip is missing."""
    def f(a, b):
        if have_raw(clip):
            video(a, b, clip, ss, grade=k.pop("grade", "eq=saturation=0.9:contrast=1.03"), **k)
            layer(a, b, (ov(a, b) if ov else "") + (credit(cred) if cred else ""))
        else:
            o = dict(fallback[2]); o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
            pxshot(a, b, fallback[1], o)
            if ov: layer(a, b, ov(a, b))
        _fx(fx, a)
    return f


def PERSON(people, bg, place_=None, op=0.6, cred=None):
    """Person intro: 1-2 portraits with name tags over a dimmed backdrop, optional place super.
    people = [(img, name, role, t_tag, crop)]; missing photos are skipped (tag only)."""
    def f(a, b):
        BG(bg, a, b)
        inner = scrim(op)
        ok = [p for p in people if have_img(p[0])]
        if len(ok) == 1:
            img, nm, rl, tt, cr = ok[0]
            inner += portrait(a, b, img, cx=560, cy=470, w=480, h=600, crop=cr) + tag(nm, rl, tt, x=880, y=400)
        elif len(ok) == 2:
            for i, (img, nm, rl, tt, cr) in enumerate(ok):
                cx = 520 + i * 880
                inner += portrait(a, b, img, cx=cx - 120, cy=430, w=380, h=480, crop=cr) + tag(nm, rl, tt, x=cx - 310, y=700)
        else:
            for i, (img, nm, rl, tt, cr) in enumerate(people):
                inner += tag(nm, rl, tt, x=110, y=360 + i * 190)
        if place_: inner += place(place_[0], place_[1], place_[2], y=place_[3] if len(place_) > 3 else 850)
        if cred: inner += credit(cred)
        layer(a, b, inner)
        _fx([("whoosh", a - 0.05, 0.4)], a)
    return f


def FV(kind, clip, ss, frame=(960, 480, 1240), ov=None, cred=None, op=0.7, speed=1.0, crop=None, grade="eq=saturation=0.9:contrast=1.03", fx=(), **o):
    """Framed real clip over a dimmed pixel backdrop (small or square sources)."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
    def f(a, b):
        pxshot(a, b, kind, o)
        layer(a, b, scrim(op))
        video(a, b, clip, ss, speed=speed, crop=crop, grade=grade, zoom=(1.0, 1.04), frame=frame)
        layer(a, b, (ov(a, b) if ov else "") + (credit(cred) if cred else ""))
        _fx(fx or [("whoosh", a - 0.05, 0.35)], a)
    return f


def PO(kind, img, crop=None, w=1100, h=700, cx=960, cy=500, ov=None, cred=None, op=0.68, **o):
    """Real photo / paper figure framed over a dimmed pixel backdrop."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
    def f(a, b):
        pxshot(a, b, kind, o)
        layer(a, b, scrim(op) + photo(a, b, img, w=w, h=h, cx=cx, cy=cy, crop=crop) + (ov(a, b) if ov else "") + (credit(cred) if cred else ""))
        _fx([("whoosh", a - 0.05, 0.35)], a)
    return f


TAG = lambda name, role, t, **k: (lambda a, b: tag(name, role, t, **k))
CR = lambda text: (lambda a, b: credit(text))
KD = lambda text, t=None, **k: K(text, t, cls="dark", **k)
PL = lambda l1, l2, t, **k: (lambda a, b: place(l1, l2, t, **k))



def RX(kind, img, crop=None, hl=None, w=1240, h=760, cx=960, cy=520, ov=None, cred=None, op=0.68, **o):
    """Receipt screenshot over a dimmed pixel scene; hl = (t, x0, y0, x1, y1) amber box in 0..1 image coords."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
    def f(a, b):
        pxshot(a, b, kind, o)
        h_ = (s(hl[0]),) + tuple(hl[1:]) if hl else None
        layer(a, b, scrim(op) + shot_ss(a, b, img, crop, w=w, h=h, cx=cx, cy=cy, hl=h_) + (ov(a, b) if ov else "") + (credit(cred) if cred else ""))
        _fx([("whoosh", a - 0.05, 0.35)], a)
    return f




exec(open(H / "mshots.py", encoding="utf-8").read().split("if __name__")[0])


def MN(name, ov=None, fx=()):
    """Full-frame Manim clip (stock/raw/mn_<name>.mp4) placed in its MSHOTS window; no push, no grade."""
    def f(a, b):
        t0 = MSHOTS[name][0]
        video(a, b, "mn_" + name, max(0.0, s(a) - t0), zoom=None, grade="")
        if ov: layer(a, b, ov(a, b))
        _fx(fx, a)
    return f


def LIST(items, x=250, y0=300, dy=110, size=56):
    """Recap list: each (text, t) line appears on its spoken word."""
    return lambda a, b: "".join(kw([("&ndash;&nbsp;" + tx, t)], x=x, y=y0 + i * dy, size=size, align="left", maxw=1500) for i, (tx, t) in enumerate(items))


CH = lambda n: f"CHAPTER &nbsp;&middot;&nbsp; {n}"
CR_SIMONS = "Video: Simons Foundation on YouTube"
CR_INI = "Video: Isaac Newton Institute on YouTube"

SHOTS = [
    # ===================== COLD OPEN: DANTZIG =====================
    ("0:00.00", P("late_class", enter=R("late", 5, -1.0), board=99, tin="fade", fin=1.0, cam={"z": [1.0, 1.08]},
                  ov=PL("UNIVERSITY OF CALIFORNIA, BERKELEY", "1939", 0.4))),
    ("0:06.88", P("impossible", label=99, solved=99, cam={"z": [1.0, 1.12]}, ov=OV(KD("He assumed they were homework.", W("assumed", 9), y=930, size=54)))),
    ("0:12.42", P("copy_night", days=[R("took", 12.4), R("harder", 14.5)], cam={"z": [1.0, 1.08]},
                  ov=OV(KD("They felt harder than usual.", W("felt", 14), y=930, size=54)))),
    (W("handed", 16.5) - 0.2, P("hand_in", cam={"z": [1.0, 1.08]})),
    ("0:19.96", P("knock", knock=R("banging", 23, -0.3), open=R("Those", 25.8, -0.6), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("Six weeks later. Early on a Sunday morning.", W("six", 20), y=60, size=52)), fx=[("impact", W("banging", 23), 0.4)])),
    ("0:25.90", P("impossible", label=R("famous", 28.2), solved=R("solved", 34.5), cam={"z": [1.12, 1.0]},
                  ov=OV(KD("Famous unsolved problems in statistics", W("famous", 28.2), y=930, size=52, end=W("Danzig", 34))),
                  fx=[("click", W("famous", 28.2), 0.3), ("notif", W("solved", 34.5), 0.4)])),
    (W("Nobody", 36.3) - 0.2, PO("late_class", "dantzig_1936", w=520, h=650, cx=560, cy=480, enter=-9, board=-9,
                                cred="Photo: George B. Dantzig, 1936 (public domain), via Wikimedia Commons",
                                ov=OV(TAG("George Dantzig", "Graduate student, Berkeley", W("Nobody", 36.3) + 0.2, x=900, y=380),
                                      K("Nobody told him", W("Nobody", 36.3), x=900, y=610, size=58, align="left", maxw=900),
                                      K("they were impossible.", W("impossible", 37.7), x=900, y=690, size=58, align="left", maxw=900, col="#e0b23a")))),

    # ===================== THE VERDICT =====================
    ("0:39.10", P("verdict", paper=R("test", 42.5), words=99, cam={"z": [1.0, 1.08]},
                  ov=OV(KD("When someone told you what you were", W("someone", 39.5), y=60, size=52)))),
    (W("moment", 44.5) - 0.2, P("at_board", blank=R("blank", 48.3), cam={"z": [1.0, 1.12]})),
    ("0:49.42", REAL("pxb_kids_class", 1.0, ("p", "verdict", {"paper": -9, "words": 99}), zoom=(1.0, 1.06),
                     ov=OV(KD("Somewhere around age 10 or 12", W("Somewhere", 52), y=900, size=56)))),
    ("0:55.72", P("verdict", paper=-9, words=0.2, cam={"z": [1.1, 1.2]}, fx=[("click", 55.9, 0.3)])),
    ("0:58.10", REAL("pxb_student_lamp", 1.0, ("p", "at_board", {}), zoom=(1.0, 1.06),
                     ov=OV(K("Are some brains built for math?", W("Are", 59), y=80, size=64),
                           K("What would it take to get better?", W("what", 64), y=170, size=58, col="#e0b23a")))),
    ("1:07.20", REAL("pxb_writing", 2.0, ("p", "recall", {}), zoom=(1.0, 1.06),
                     ov=OV(KD("You'll solve two problems yourself.", W("solve", 70.5), y=900, size=54, end=W("Keep", 73.3)),
                           KD("Keep a pen nearby.", W("Keep", 73.3), y=900, size=60)))),

    # ===================== CHAPTER 1: FAST IS NOT DEEP =====================
    ("1:15.50", CHAP(CH("ONE"), "Fast is not deep", ("p", "fast_hand", {"hand": 99}))),
    ("1:18.62", P("fast_hand", hand=R("shoots", 80.5), cam={"z": [1.0, 1.1]}, fx=[("pop", W("shoots", 80.5), 0.3)])),
    ("1:23.58", PERSON([("schwartz_1970", "Laurent Schwartz", "Mathematician", W("Laurent", 84), None)],
                       ("v", "pxb_paris", 1.0, "lycee", {"hands": 99, "worry": 99}), place_=("FRANCE", "FIELDS MEDAL, 1950", W("1950", 87)),
                       cred="Photo: Konrad Jacobs, CC BY-SA 2.0 de, via Wikimedia Commons")),
    (W("Fields", 88.5) - 0.3, P("medal", plaque=0.5, cam={"z": [1.0, 1.1]}, ov=OV(KD("The highest honor in mathematics", W("highest", 90), y=930, size=52)))),
    ("1:32.96", REAL("pxb_chalkboard", 1.0, ("p", "lycee", {}), zoom=(1.0, 1.06))),
    ("1:37.50", P("lycee", hands=[R("Whenever", 104), R("before", 108.5)], worry=R("secretly", 111.5), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("As a teenager, he was convinced he was stupid.", W("teenager", 97.7), y=60, size=50, end=W("wrote", 100.8))))),
    ("1:56.42", P("deep_quick", quick=R("quick", 118.5), deep=R("deep", 119.3), cam={"z": [1.0, 1.06]},
                  ov=OV(KD("He refused to move on until he understood it completely.", W("refused", 122), y=60, size=48)))),

    # Mirzakhani
    ("2:06.72", PERSON([("mirzakhani_simons", "Maryam Mirzakhani", "Mathematician", W("Mariam", 126.7), None)],
                       ("v", "pxb_tehran_metro", 1.0, "jungle", {"tries": 99, "path": 99}), cred=CR_SIMONS)),
    (W("Growing", 129.3) - 0.1, FV("jungle", "yt_LxuVSW4VZ78", 29.5, frame=(960, 470, 1240), cred=CR_SIMONS, tries=99, path=99,
                                  ov=PL("TEHRAN, IRAN", "AROUND AGE 12", W("12", 131.5)))),
    ("2:16.50", REAL("pxb_student_papers", 2.0, ("p", "verdict", {}), zoom=(1.0, 1.06), ov=OV(KD("Her confidence dropped.", W("confidence", 136.6), y=900, size=56)))),
    ("2:18.30", PO("medal", "mirzakhani_fields_ceremony_2014", w=1100, h=700, cy=470, plaque=99,
                   cred="Photo: Florian Caullery, CC BY-SA 3.0, via Wikimedia Commons",
                   ov=OV(KD("2014: the first woman to win the Fields Medal", W("first", 140), y=920, size=50)))),
    ("2:23.40", P("jungle", tries=[R("slow", 144.8), R("trick", 148.7)], path=R("path", 149.7), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("Like being lost in a jungle", W("lost", 146.3), y=930, size=54)))),
    ("2:31.24", FV("paper_floor", "yt_LxuVSW4VZ78", 152.0, frame=(960, 470, 1240), cred=CR_SIMONS, girl=99, paint=99,
                   ov=OV(KD("Giant sheets of paper", W("giant", 152.5), y=900, size=54)))),
    ("2:34.58", P("paper_floor", girl=0.3, paint=R("painting", 157.5, -0.3), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("Her daughter called it painting.", W("painting", 157.5), y=930, size=54)))),
    ("2:38.88", P("sprint_climb", sprint=R("sprinter", 160.4), climb=R("climber", 162), judge=R("judge", 163.5), cam={"z": [1.0, 1.06]})),
    ("2:46.60", REAL("pxb_runner", 1.0, ("p", "sprint_climb", {}), zoom=(1.0, 1.06), ov=OV(KD("School math rewards the sprint.", W("School", 166.5), y=900, size=56)))),
    ("2:49.06", REAL("pxb_climber_fog", 4.0, ("p", "sprint_climb", {}), zoom=(1.0, 1.08), ov=OV(K("Real math is the mountain.", W("Real", 169), y=80, size=70)))),

    # ===================== CHAPTER 2: THE DREAD =====================
    ("2:51.48", CHAP(CH("TWO"), "It's the dread, not the math", ("p", "scanner", {"slide": 99, "signal": 99, "light": 99}))),
    ("2:56.56", PERSON([("beilock_2024", "Sian Beilock", "Cognitive scientist", W("Baylock", 179), None)],
                       ("p", "scanner", {"slide": 99, "signal": 99, "light": 99}), place_=("UNIVERSITY OF CHICAGO", "2012", W("2012", 176.7)),
                       cred="Photo: US Department of Education, CC BY 2.0, via Wikimedia Commons")),
    (W("Some", 184.6) - 0.2, P("scanner", slide=0.3, signal=R("signal", 190), light=R("lit", 192.6), cam={"z": [1.0, 1.1]},
                              ov=OV(KD("Just seeing that math was coming", W("seeing", 189.5), y=60, size=52, end=W("threat", 194))),
                              fx=[("click", W("signal", 190), 0.3)])),
    (W("threat", 194) - 0.3, RX("scanner", "lyons_beilock_2012_fig1", w=1100, h=700, slide=-9, signal=-9, light=-9,
                               cred="Lyons &amp; Beilock, PLoS ONE 2012, CC BY")),
    (MSHOTS["Anticipation"][0], MN("Anticipation")),
    ("3:32.70", P("mental_desk", cards=0.3, label=R("working", 214.4), worry=R("Worry", 219.2), cam={"z": [1.0, 1.08]})),
    ("3:41.76", P("phone_apps", apps=0.3, lag=1.2, cam={"z": [1.0, 1.1]})),
    ("3:45.44", RX("write_worry", "ss_ramirez_beilock_2011_epmc", w=1200, h=600, write=99, flow=99, calm=99,
                   cred="Ramirez &amp; Beilock, Science 2011", ov=PL("THE FIX", "2011", W("2011", 228.4)))),
    (W("Right", 233.9) - 0.2, P("write_worry", write=R("writing", 235.5), flow=R("worked", 239.4), calm=R("lab", 241), cam={"z": [1.0, 1.06]},
                               ov=OV(KD("10 minutes writing honestly about their worries", W("10", 236), y=60, size=50, end=W("worked", 239.4))))),
    (W("ninth", 243) - 0.3, P("exam_hall", cam={"z": [1.0, 1.08]}, ov=OV(KD("Ninth graders, a real final exam", W("ninth", 243), y=930, size=52)))),
    ("4:09.12", P("mental_desk", cards=-9, label=-9, worry=99, cam={"z": [1.1, 1.0]},
                  ov=OV(KD("Move the worry off the desk and onto the paper.", W("Writing", 249), y=930, size=50, end=W("Try", 253.2)),
                        KD("Try it before your next exam.", W("Try", 253.2), y=930, size=56)))),

    # ===================== CHAPTER 3: YOUR TURN (GAUSS) =====================
    ("4:15.56", CHAP(CH("THREE"), "Your turn", ("p", "old_school", {"task": 99, "quiet": 99}))),
    (W("Carl", 258) - 0.3, PERSON([("gauss_jensen_1840", "Carl Friedrich Gauss", "One of the greatest mathematicians in history", W("Carl", 258), None)],
                                  ("p", "old_school", {"task": 99, "quiet": 99}), place_=("GERMANY", "THE 1780s", W("schoolboy", 266.8)),
                                  cred="Portrait: Christian Albrecht Jensen, 1840 (public domain)")),
    ("4:26.32", P("old_school", task=R("Add", 270.8), quiet=R("quiet", 274), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("The story's details change from teller to teller.", W("details", 263.6), y=60, size=46, end=W("When", 266.3))))),
    (W("Gauss", 276) - 0.2, P("quick_slate", write=0.3, place=1.6, cam={"z": [1.0, 1.1]})),
    (MSHOTS["Question"][0], MN("Question", fx=[("pop", W("Pause", 281), 0.3)])),
    (MSHOTS["SlowAdd"][0], MN("SlowAdd")),
    (MSHOTS["Pairs"][0], MN("Pairs", fx=[("click", W("101", 301.6), 0.3), ("click", W("101", 308.2), 0.3), ("click", W("101", 312.3), 0.3), ("notif", W("5", 322.3), 0.4)])),
    (MSHOTS["Thousand"][0], MN("Thousand", fx=[("notif", W("is", 339.1), 0.4)])),
    ("5:47.78", P("pattern_eyes", idea=R("pattern", 351.2), cam={"z": [1.0, 1.15], "x": [320, 360], "y": [180, 180]},
                  ov=OV(K("You didn't get faster at adding.", W("didn't", 349.3), y=80, size=60),
                        K("You saw a pattern.", W("saw", 351.2), y=170, size=64, col="#e0b23a")))),
    (MSHOTS["Formula"][0], MN("Formula")),
    (MSHOTS["Formula"][1], REAL("pxb_sketch", 1.0, ("p", "pattern_eyes", {}), zoom=(1.0, 1.06),
                                ov=OV(K("It isn't speed with numbers.", W("isn't", 371.5), y=80, size=60),
                                      K("It's spotting the structure.", W("spotting", 373.7), y=170, size=60, col="#e0b23a"),
                                      KD("A habit you can build, not a gift you're born with.", W("habit", 376.5), y=900, size=48)))),

    # ===================== CHAPTER 4: MAKE IT HARD ON PURPOSE =====================
    ("6:20.06", CHAP(CH("FOUR"), "Make it hard on purpose", ("p", "gym", {"easy": 99, "heavy": 99}),
                     ov=OV(KD("The methods that work best feel worse.", W("methods", 383.5), y=880, size=50)))),
    (W("psychologist", 388.5) - 0.2, PERSON([("bjork_2014", "Robert Bjork", "Psychologist, UCLA", W("Robert", 389.3), None)],
                                           ("v", "pxb_library_student", 2.0, "reread", {"relax": 99}),
                                           cred="Photo: UQx Think101, CC BY 3.0, via Wikimedia Commons",
                                           place_=("DESIRABLE DIFFICULTY", "", W("desirable", 391)))),
    ("6:33.72", REAL("pxb_study_group", 6.0, ("p", "recall", {}), zoom=(1.0, 1.06),
                     ov=OV(KD("Smooth and easy often doesn't stick.", W("smooth", 394.3), y=900, size=52, end=W("When", 397.3)),
                           KD("Effort is your brain doing the work.", W("effort", 397.8), y=900, size=52)))),
    ("6:41.42", PERSON([("roediger_washu", "Henry Roediger", "Psychologist", W("Henry", 405), None),
                        ("karpicke_purdue_lab", "Jeffrey Karpicke", "Psychologist", W("Karpakie", 406.5), None)],
                       ("p", "reread", {"relax": 99}), place_=("THE TESTING EXPERIMENT", "2006", W("2006", 403.6)),
                       cred="Photos: Washington University in St. Louis; Purdue University")),
    ("6:49.32", P("reread", relax=R("again", 410.5), cam={"z": [1.0, 1.08]}, ov=OV(KD("Group 1: read it again and again", W("One", 409.3), y=930, size=52)))),
    ("6:51.56", P("recall", close=R("once", 412.5), cam={"z": [1.0, 1.08]}, ov=OV(KD("Group 2: read once, then recall from memory", W("Another", 411.6), y=930, size=50)))),
    ("6:56.30", P("week_later", flip=R("week", 418.9), result=R("remembered", 421), cam={"z": [1.0, 1.06]},
                  ov=OV(KD("The re-readers felt more confident.", W("re", 416.3), y=60, size=50, end=W("week", 418.9)),
                        KD("A week later, the self-testers remembered far more.", W("week", 418.9), y=60, size=46)))),
    ("7:02.98", RX("reread", "ss_roediger_karpicke_2006_p1", w=1150, h=760, relax=-9, cred="Roediger &amp; Karpicke, Psychological Science 2006",
                   ov=OV(KD("Familiar isn't the same as knowing.", W("familiar", 427.3), y=930, size=54)))),
    ("7:09.76", P("ebbinghaus", cards=0.3, test=R("tested", 437.5), cam={"z": [1.0, 1.08]},
                  ov=PL("GERMANY", "THE 1880s", W("1880", 431.7)))),
    (W("Hermann", 434) - 0.2, PO("ebbinghaus", "ebbinghaus", w=500, h=640, cx=560, cy=480, cards=-9, test=99,
                                  cred="Photo: Hermann Ebbinghaus (public domain)",
                                  ov=OV(TAG("Hermann Ebbinghaus", "Psychologist", W("Hermann", 434) + 0.2, x=900, y=420)))),
    (MSHOTS["Forgetting"][0], MN("Forgetting")),
    ("7:38.46", P("classroom7", blocked=99, mixed=99, cam={"z": [1.0, 1.08]}, ov=PL("SEVENTH GRADE, TAMPA", "2014", W("2014", 461.9)))),
    (W("Doug", 463.5) - 0.2, RX("classroom7", "ss_rohrer_2014_p1", w=1150, h=760, blocked=99, mixed=99,
                               cred="Rohrer, Dedrick &amp; Burgess, Psychonomic Bulletin &amp; Review 2014")),
    (MSHOTS["Interleave"][0], MN("Interleave")),
    ("8:07.04", P("classroom7", blocked=0.3, mixed=R("mixed", 494), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("Same type every time: you never have to choose.", W("When", 488.6), y=60, size=46, end=W("mixed", 494)),
                        KD("Mixed: you ask what kind of problem it is.", W("mixed", 494), y=60, size=46)))),
    (W("question", 499.4) - 0.3, REAL("pxb_whiteboard", 2.0, ("p", "classroom7", {}), zoom=(1.0, 1.06), ov=OV(K("That question is half of math.", W("half", 500.3), y=80, size=64)))),
    ("8:21.30", P("gym", easy=0.2, heavy=R("strain", 506), cam={"z": [1.0, 1.08]}, ov=OV(KD("The strain is the point.", W("strain", 506), y=930, size=56)))),

    # ===================== CHAPTER 5: ASK WHY =====================
    (MSHOTS["NegQ"][0], MN("NegQ", fx=[("pop", W("Take", 516.2), 0.3)])),
    (MSHOTS["NegQ"][1], P("walk_film", fwd=R("forward", 520.6), back=R("backward", 522.2), play=R("normally", 525), rev=R("reverse", 527.5),
                          both=R("look", 539), cam={"z": [1.0, 1.06]},
                          ov=OV(KD("Positive &times; negative = negative", W("Positive", 533.7), y=930, size=54, end=W("And", 536)),
                                KD("Negative &times; negative = ?", W("And", 536), y=930, size=54, end=W("look", 539))))),
    (MSHOTS["Signs"][0], MN("Signs")),
    (MSHOTS["Signs"][1], CHAP(CH("FIVE"), "Ask why it works", ("v", "pxb_sketch", 2.0, "walk_film", {}),
                              ov=OV(KD("If you can explain it or draw it, it's yours.", W("explain", 552), y=880, size=50)))),
    (W("If", 556.6), REAL("pxb_student_papers", 8.0, ("p", "recall", {}), zoom=(1.0, 1.06), ov=OV(KD("If you can't, you've found where to dig.", W("can't", 557), y=900, size=54)))),

    # ===================== CHAPTER 6: STUCK IS NORMAL (WILES) =====================
    ("9:20.14", CHAP(CH("SIX"), "Being stuck is normal", ("p", "attic", {"years": 99}))),
    ("9:23.46", PERSON([("wiles_boston_1995", "Andrew Wiles", "Mathematician", W("Andrew", 566), None)],
                       ("p", "attic", {"years": 99}), place_=("PRINCETON", "1986", W("1986", 563.4)),
                       cred="Photo: Klaus Barner, CC BY-SA 3.0, via Wikimedia Commons")),
    (MSHOTS["Fermat"][0], MN("Fermat")),
    ("9:34.36", P("attic", years=[R("worked", 579), R("wife", 584.4)], cam={"z": [1.0, 1.1]},
                  ov=OV(KD("He fell for it at age 10, in a library book.", W("fallen", 574.6), y=60, size=48, end=W("worked", 579)),
                        KD("Seven years, mostly alone, in secret", W("seven", 582.5), y=60, size=52)))),
    ("9:46.18", REAL("pxb_kings_cam", 1.0, ("p", "lecture93", {}), zoom=(1.0, 1.06), ov=PL("CAMBRIDGE, ENGLAND", "JUNE 1993", W("June", 586.5)))),
    (W("lecture", 588.2) - 0.2, FV("lecture93", "yt_nlUimyJpWtI", 34.2, frame=(960, 470, 1200), cred=CR_INI, write=-9, done=99)),
    (W("announced", 589.8) - 0.4, P("lecture93", write=-9, done=0.5, cam={"z": [1.0, 1.06]})),
    ("9:52.02", P("presses", stack=0.3, cam={"z": [1.0, 1.08]})),
    ("9:54.80", P("gap", circle=R("gap", 597.7), label=R("serious", 598.8), cam={"z": [1.0, 1.1]})),
    ("10:00.28", P("stuck_year", slump=R("failed", 605.6), year=[0.3, 10.5], watch=R("watching", 602.8), cam={"z": [1.0, 1.06]},
                   ov=OV(KD("For about a year, with the whole field watching", W("year", 600.8), y=60, size=48, end=W("Attempt", 604.5)),
                         KD("He came close to giving up.", W("close", 606.5), y=60, size=52)))),
    ("10:11.60", P("epiphany", light=99, look=99, cam={"z": [1.0, 1.06]}, ov=PL("MONDAY, SEPTEMBER 19", "1994", W("Monday", 612.3)))),
    (W("Working", 615.3) - 0.2, PERSON([("taylor_edinburgh_1996", "Richard Taylor", "His former student", W("Richard", 616.6), None)],
                                      ("p", "epiphany", {"light": 99, "look": 99}),
                                      cred="Photo: Klaus Barner, CC BY-SA 3.0, via Wikimedia Commons")),
    ("10:21.58", P("epiphany", light=0.3, look=R("saw", 622.3), cam={"z": [1.0, 1.1]})),
    (W("He", 624.2) - 0.1, FV("epiphany", "yt_nlUimyJpWtI", 41.5, frame=(960, 470, 1200), cred=CR_INI, light=-9, look=-9,
                             ov=OV(KD("&ldquo;The most important moment of my working life&rdquo;", W("called", 624.3), y=900, size=48)))),
    ("10:28.24", P("epiphany", light=-9, look=-9, cam={"z": [1.12, 1.2]}, ov=OV(K("The proof was complete.", W("proof", 628.4), y=80, size=70)))),
    ("10:30.02", P("dark_room", bump=[R("stumbling", 633.5), R("furniture", 635.5)], switch=R("switch", 637.9), next=R("next", 641.2), cam={"z": [1.0, 1.08]})),
    ("10:42.84", REAL("pxb_window_light", 2.0, ("p", "dark_room", {"switch": -9}), zoom=(1.0, 1.06),
                      ov=OV(KD("One of the greatest mathematicians alive spent most of his time confused.", W("One", 644.6), y=900, size=44)))),
    ("10:49.22", REAL("pxb_climber_fog", 12.0, ("p", "dark_room", {}), zoom=(1.0, 1.06),
                      ov=OV(K("Being stuck is normal.", W("stuck", 649.6), y=80, size=70),
                            K("It's what math feels like, for everyone.", W("doing", 651.6), y=170, size=54, col="#e0b23a")))),

    # ===================== ENDING =====================
    ("10:54.86", REAL("pxb_study_group", 20.0, ("p", "recall", {}), zoom=(1.0, 1.06),
                      ov=OV(K("Can anyone get better at math?", W("anyone", 655.4), y=80, size=62), K("Yes.", W("Yes", 657.6), y=170, size=80, col="#e0b23a")))),
    ("11:01.42", P("dark_room", bump=-9, switch=-9, next=99, cam={"z": [1.0, 1.05]}, op=0.6,
                   ov=OV(lambda a, b: scrim(0.62),
                         K("People who get good:", W("People", 661.4), x=250, y=180, size=60, align="left", maxw=1500),
                         LIST([("look for the pattern first", W("pattern", 667.5)), ("test themselves instead of rereading", W("test", 669.5)),
                               ("spread practice out and mix it up", W("spread", 671.3)), ("ask why a rule works", W("why", 675)),
                               ("treat being stuck as part of the job", W("stuck", 677))], y0=300, dy=105, size=52)))),
    ("11:22.06", P("at_board", blank=-9, cam={"z": [1.0, 1.08]}, ov=OV(KD("That blank feeling was never a measure of what you could do.", W("blank", 682.2), y=930, size=46)))),
    ("11:26.06", PO("late_class", "dantzig_1976_medal", w=900, h=640, enter=-9, board=-9,
                    cred="Photo: White House Photographic Office, 1976 (public domain)",
                    ov=OV(TAG("George Dantzig", "Inventor of the simplex method", W("Danzig", 686.5), x=110, y=830)))),
    (MSHOTS["Simplex"][0], MN("Simplex")),
    (MSHOTS["Simplex"][1], REAL("pxb_plane", 1.0, ("p", "schedules", {}), zoom=(1.0, 1.06), ov=PL("BERKELEY", "1939", W("1939", 693.6)))),
    (W("he", 694.9) - 0.1, P("late_class", enter=0.2, board=1.6, cam={"z": [1.0, 1.08]})),
    (W("He", 696.9) - 0.1, P("impossible", label=-9, solved=0.3, cam={"z": [1.0, 1.1]},
                            ov=OV(KD("No one had told him to stop.", W("stop", 699.9), y=930, size=54)))),
    (W("Maybe", 700.9) - 0.1, DIMP("late_class", op=0.55, enter=-9, board=-9, tout="fade", fout=1.8, cam={"z": [1.05, 1.12]},
                                   ov=OV(lambda a, b: kw([("Maybe no one should have told you either.", W("Maybe", 700.9))], y=470, size=66)))),
]
