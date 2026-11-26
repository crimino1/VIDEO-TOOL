# Euler film shot list (exec'd in build.py's namespace). Documentary cut: chapter cards, place/year supers, people, real footage,
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

WX = lambda w_, t: W(w_, t, exact=True)
_PO = PO
def PO(kind, img, **k):
    """PO that falls back to the bare pixel scene when the photo is missing."""
    if have_img(img): return _PO(kind, img, **k)
    o = {kk: v for kk, v in k.items() if kk not in ("crop", "w", "h", "cx", "cy", "cred", "op")}
    return P(kind, **o)


def PORT(img, name, role, t, cx=300, cy=500, w=440, h=560, crop=None, x=80, y=840, cred=None):
    """Portrait + name tag overlay for a Manim shot with room on the left."""
    def ov(a, b):
        if not have_img(img): return tag(name, role, t, x=x, y=y)
        return portrait(a, b, img, cx=cx, cy=cy, w=w, h=h, crop=crop) + tag(name, role, t, x=x, y=y) + (credit(cred) if cred else "")
    return ov


Z = lambda z0=1.0, z1=1.1: {"z": [z0, z1]}
CR_Z = "Zeki et al. 2014, Front. Hum. Neurosci., CC BY"

SHOTS = [
    # ===================== COLD OPEN: THE BEAUTY STUDY =====================
    ("0:00.00", REAL("pxe_london", 2.0, ("p", "rating", {"sort": 99}), zoom=(1.0, 1.08), ov=PL("LONDON", "2014", 0.5))),
    (W("15", 2.9) - 0.45, REAL("pxe_lab", 1.0, ("p", "rating", {"sort": 99}), zoom=(1.0, 1.06),
                              ov=OV(KD("15 mathematicians", W("15", 2.9), y=930, size=56)))),
    ("0:06.04", P("rating", sort=R("looked", 6.5), cam=Z(), ov=OV(KD("60 equations, from ugly to beautiful", W("60", 6.88), y=930, size=52)),
                  fx=[("click", W("rated", 8.08), 0.3)])),
    ("0:10.72", P("scanner", slide=0.3, signal=99, light=99, cam=Z())),
    (W("One", 12.96) - 0.1, PO("scanner", "zeki2014_fig1", crop=(0.03, 0.6, 1.0, 1.0), w=1500, h=640, cy=500, slide=-9, signal=99, light=99, cred=CR_Z)),
    (MSHOTS["Equations"][0], MN("Equations", fx=[("pop", W("tiny", 23.54), 0.3)])),
    (MSHOTS["Equations"][1], P("scanner", slide=-9, signal=R("looked", 26.36), light=R("lit", 29.26), cam=Z(1.05, 1.15),
                               fx=[("notif", W("lit", 29.26), 0.35)])),
    (W("part", 28.5) - 0.2, PO("scanner", "ss_zeki_fig", w=1560, h=680, cy=500, slide=-9, signal=99, light=-9, cred=CR_Z)),
    ("0:30.22", P("gallery", paint=0.3, song=R("song", 33.28), cam=Z(1.0, 1.06))),
    (MSHOTS["Ramanujan"][0], MN("Ramanujan", ov=PORT("ramanujan", "Srinivasa Ramanujan", "Mathematician", W("Srinivasa", 37.8)))),
    (MSHOTS["Winner"][0], RX("rating", "ss_zeki2014_results_euler_ramanujan", crop=(0.28, 0.45, 0.72, 0.86), hl=(42.7, 0.05, 0.06, 0.9, 0.18),
                              w=1300, h=820, sort=-9, cred=CR_Z)),
    (WX("E", 44.64) - 0.3, MN("Winner", fx=[("pop", W("0", 48.92), 0.3)])),
    ("0:49.90", PERSON([("feynman", "Richard Feynman", "Physicist", W("Richard", 50.22), None)], ("p", "notebook", {"write": 99, "big": 99}))),
    (W("wrote", 54.0) - 0.3, P("notebook", write=0.2, big=R("big", 55.28), cam=Z(1.0, 1.08),
                              ov=OV(KD("“the most remarkable formula in math”", W("called", 56.92), y=930, size=50)))),
    (MSHOTS["Puzzle"][0], MN("Puzzle")),

    # ===================== CHAPTER ONE: THE CAST =====================
    (MSHOTS["Cast"][0], CHAP(CH("ONE"), "The cast", ("v", "pxe_chalk", 2.0, "notebook", {"write": -9, "big": -9}))),
    (W("five", 73.0) - 0.35, MN("Cast", fx=[("whoosh", W("different", 75.46) - 0.3, 0.3)])),
    (MSHOTS["Cast"][1], P("brahmagupta", zero=R("zero", 90.98), cam=Z(), ov=PL("INDIA", "628", W("628", 85.84)))),
    ("1:34.00", REAL("pxe_phone", 1.0, ("p", "brahmagupta", {}), zoom=(1.0, 1.06))),
    (MSHOTS["One"][0], MN("One")),
    (MSHOTS["Pi"][0], MN("Pi")),
    (MSHOTS["MeetE"][0], MN("MeetE")),
    (MSHOTS["MeetE"][1], REAL("pxe_counting", 1.0, ("p", "bank", {}), zoom=(1.0, 1.06))),
    (W("Say", 132.24) - 0.1, P("bank", give=0.4, grow=R("100", 134.66), cam=Z(),
                              ov=OV(KD("100% interest per year", W("100", 134.66), y=930, size=56)))),
    (MSHOTS["Interest"][0], MN("Interest", fx=[("click", W("2", 154.4), 0.25), ("notif", W("E", 176.3), 0.35)])),
    (MSHOTS["Interest"][1], PERSON([("bernoulli", "Jacob Bernoulli", "Mathematician", W("Jacob", 182.84), None)],
                                   ("p", "basel", {"calc": -9, "eureka": 99}), place_=("BASEL, SWITZERLAND", "1683", W("1683", 184.74)))),
    (W("working", 186.24) - 0.2, P("basel", calc=0.1, eureka=R("puzzle", 187.66),
                                  ov=OV(K("e is the number of growth", W("E", 188.54), y=120, size=64)))),
    (MSHOTS["Squares"][0], MN("Squares")),
    (MSHOTS["Squares"][1], P("italy", trick=R("trick", 223.78), cam=Z(), ov=PL("ITALY", "1500s", W("1500s", 220.66)))),
    (W("treated", 225.62) - 0.3, PO("italy", "hist_arsmagna1545_title", w=560, h=860, cx=960, cy=540, trick=-9,
                                     cred="Cardano, Ars Magna (1545), public domain")),
    (W("In", 227.54) - 0.1, PERSON([("descartes", "René Descartes", "Philosopher", W("Descartes", 230.46), None)],
                                  ("p", "descartes", {"word": 99}), place_=("FRANCE", "1637", W("1637", 228.02)))),
    (W("called", 231.1) - 0.3, P("descartes", word=R("imaginary", 231.52), cam=Z(1.0, 1.12),
                                ov=OV(KD("We still call them imaginary today.", W("We", 236.1), y=930, size=52)))),
    (MSHOTS["Recap"][0], MN("Recap")),

    # ===================== CHAPTER TWO: NUMBERS ARE DIRECTIONS =====================
    (MSHOTS["Road"][0], CHAP(CH("TWO"), "Numbers are directions", ("p", "phone_turn", {"q1": 99, "q2": 99}))),
    (W("directions", 255.64) - 0.9, MN("Road")),
    (MSHOTS["Quarter"][0], MN("Quarter", fx=[("click", WX("I", 284.38), 0.3)])),
    (MSHOTS["Quarter"][1], P("phone_turn", start=0.3, q1=R("quarter", 314.14), q2=R("another", 317.0), cam=Z(1.0, 1.06))),
    (MSHOTS["Sideways"][0], MN("Sideways")),

    # ===================== CHAPTER THREE: GROWTH TURNED SIDEWAYS =====================
    (MSHOTS["Growth"][0], CHAP(CH("THREE"), "Growth turned sideways", ("p", "ball_string", {"swing": -9, "arrows": 99}))),
    (W("Remember", 329.88) - 0.25, MN("Growth")),
    (MSHOTS["Growth"][1], P("ball_string", swing=0.2, arrows=R("right", 356.02), cam=Z(1.0, 1.08))),
    (MSHOTS["Sideways2"][0], MN("Sideways2")),
    (MSHOTS["Walk"][0], MN("Walk", fx=[("pop", W("minus", 411.4), 0.3)])),
    (MSHOTS["Quiz"][0], MN("Quiz", fx=[("pop", W("Pause", 421.5), 0.3)])),
    (MSHOTS["Steps"][0], MN("Steps")),

    # ===================== CHAPTER FOUR: THE MAN BEHIND IT =====================
    (MSHOTS["Steps"][1], CHAP(CH("FOUR"), "The man behind it", ("p", "euler_young", {"write": -9}))),
    (W("Leonhard", 482.08) - 0.3, PERSON([("euler_handmann", "Leonhard Euler", "Swiss mathematician", W("Leonhard", 482.08), None)],
                                        ("p", "euler_young", {}), place_=("BASEL, SWITZERLAND", "born 1707", W("1707", 485.36)))),
    (W("In", 487.04) - 0.1, PO("euler_young", "introductio_1748", w=620, h=760, cx=960, cy=520, write=-9,
                              ov=PL("INTRODUCTIO IN ANALYSIN INFINITORUM", "1748", W("1748", 487.14)))),
    (MSHOTS["EulerFormula"][0], MN("EulerFormula")),
    (MSHOTS["EulerFormula"][1], PO("euler_blind", "euler_handmann", w=500, h=640, cx=560, cy=480, dictate=99, pages=99,
                                   ov=OV(KD("Lost the sight in one eye in his 30s", W("lost", 513.1), y=930, size=50)))),
    (W("Decades", 515.62) - 0.2, P("euler_blind", dictate=R("dictated", 522.06), pages=R("Some", 524.18), cam=Z(1.0, 1.12),
                                  ov=OV(KD("often called the most prolific mathematician in history", W("prolific", 529.32), y=930, size=48)))),

    # ===================== CHAPTER FIVE: WHY IT MATTERS =====================
    (W("So", 531.92) - 0.1, CHAP(CH("FIVE"), "Why it matters", ("p", "wall_frame", {"hang": -9}))),
    (W("Something", 534.04) - 0.2, P("wall_frame", hang=R("hang", 535.74, -0.6))),
    (MSHOTS["Spin"][0], MN("Spin")),
    (MSHOTS["Spin"][1], REAL("pxe_power", 1.0, ("p", "outlet", {}), zoom=(1.0, 1.08))),
    (W("swings", 553.54) - 0.3, P("outlet", flow=0.1, label=R("50", 554.6), cam=Z(1.0, 1.06))),
    (MSHOTS["Phasor"][0], MN("Phasor")),
    (MSHOTS["Phasor"][1], P("waves", sound=R("Sound", 563.78), light=R("Light", 565.42), wifi=R("Wifi", 566.34), cam=Z(1.0, 1.06))),
    (MSHOTS["Fourier"][0], MN("Fourier")),
    (MSHOTS["Fourier"][1], P("mri_room", build=0.6, cam=Z(1.0, 1.08))),
    (MSHOTS["Schrodinger"][0], P("particles", zoom=0.3)),
    (W("equation", 580.82) - 0.7, MN("Schrodinger")),

    # ===================== CHAPTER SIX: WHY IT'S BEAUTIFUL =====================
    (MSHOTS["Schrodinger"][1], CHAP(CH("SIX"), "Why it's beautiful", ("v", "pxe_reader", 1.0, "magazine", {"vote": -9}))),
    (W("Long", 591.84) - 0.2, REAL("pxe_reader", 3.5, ("p", "magazine", {}), zoom=(1.0, 1.06))),
    (W("readers", 593.8) - 0.2, P("magazine", vote=R("voted", 596.84), cam=Z(),
                                 ov=OV(KD("The Mathematical Intelligencer: the most beautiful theorem", W("Mathematical", 595.46), y=930, size=46)))),
    (MSHOTS["Finale"][0], MN("Finale", fx=[("pop", W("cancels", 625.94), 0.3)])),
    (MSHOTS["Finale"][1], P("scanner", slide=-9, signal=0.3, light=R("switched", 640.8), cam=Z(1.0, 1.12))),
    (W("You've", 642.12) - 0.1, REAL("pxe_walk", 2.0, ("p", "notebook", {}), zoom=(1.0, 1.06))),
    (MSHOTS["Final"][0], MN("Final")),
]
