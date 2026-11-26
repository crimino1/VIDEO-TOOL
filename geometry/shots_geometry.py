# Geometry film shot list (exec'd in build.py's namespace). Documentary cut: chapter cards, place/year supers, people, real footage,
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

CR_PD = lambda s_: f"{s_}, public domain"
EUC2 = "byrne_euclid" if have_img("byrne_euclid") else "euclid_papyrus"

SHOTS = [
    # ===================== COLD OPEN: THE NILE =====================
    ("0:00.00", REAL("pxg_nile", 1.0, ("p", "nile_flood", {}), zoom=(1.0, 1.08), ov=PL("ANCIENT EGYPT", "the river Nile", 0.6))),
    (W("It", 4.3) - 0.1, P("nile_flood", flood=0.3, cam=Z(1.0, 1.08))),
    (W("For", 10.4) - 0.1, REAL("pxg_fields", 2.0, ("p", "nile_flood", {"flood": -9}), zoom=(1.0, 1.06),
                              ov=OV(KD("a gift: rich, black mud", W("rich", 13.0), y=930, size=52)))),
    (W("But", 16.8) - 0.1, REAL("pxg_flood", 1.0, ("p", "nile_flood", {"flood": -9}), zoom=(1.0, 1.06))),
    (W("The", 22.4) - 0.1, P("nile_flood", flood=-9, cam=Z(1.05, 1.15), ov=OV(KD("Whose land was whose?", W("whose", 28.0), y=930, size=56)))),
    (W("To", 30.6) - 0.1, P("rope_stretchers", stretch=R("stretched", 35.5), peg=R("corners", 35.5), mark=R("drew", 35.5), cam=Z(1.0, 1.08))),
    (W("About", 43.0) - 0.1, PERSON([("herodotus", "Herodotus", "Greek historian", W("Herodotus", 43.0), None)],
                                   ("v", "pxg_karnak", 1.0, "nile_flood", {}), place_=("ABOUT 2,400 YEARS AGO", "", W("About", 43.0)))),
    (W("He", 48.5) - 0.1, PO("rope_stretchers", "herodotus_page", w=900, h=760, cx=960, cy=520, stretch=-9, peg=-9, mark=-9,
                            cred=CR_PD("Herodotus, Histories (Vat. gr. 122)"))),
    (MSHOTS["GeoName"][0], MN("GeoName")),
    (MSHOTS["GeoName"][1], P("rope_stretchers", stretch=-9, peg=-9, mark=-9, cam=Z(1.0, 1.06))),
    (W("Yet", 62.3) - 0.1, P("syene_well", sun=-9, measure=0.6, cam=Z(1.0, 1.06))),
    (W("They", 69.7) - 0.1, REAL("pxg_bridge", 2.0, ("p", "builder_corner", {}), zoom=(1.0, 1.06))),
    (W("And", 72.8) - 0.1, P("gps_street", sats=-9, pin=1.2, cam=Z(1.0, 1.08))),
    (W("So", 76.4) - 0.1, REAL("pxg_earth", 1.0, ("p", "syene_well", {}), zoom=(1.0, 1.05))),
    (MSHOTS["Roadmap"][0], MN("Roadmap")),

    # ===================== ONE: A DOT AND A LINE =====================
    (MSHOTS["PointLine"][0], CHAP(CH("ONE"), "A dot and a line", ("v", "pxg_fields", 6.0, "nile_flood", {}))),
    (W("touch", 93.7) + 0.6, MN("PointLine")),

    # ===================== TWO: EUCLID =====================
    (MSHOTS["PointLine"][1], CHAP(CH("TWO"), "Euclid's castle", ("p", "euclid_class", {"line": 99, "circle": 99}))),
    (W("in", 135.3) + 1.0, P("euclid_class", line=99, circle=99, cam=Z(), ov=PL("ALEXANDRIA, EGYPT", "around 300 BC", W("Alexandria", 135.0)))),
    (W("He", 143.1) - 0.1, PO("euclid_class", "euclid_papyrus", w=1100, h=700, line=-9, circle=-9, cred=CR_PD("Euclid's Elements, papyrus fragment P. Oxy. I 29"))),
    (W("He", 145.6) - 0.1, P("euclid_class", line=0.4, circle=99, cam=Z(1.05, 1.15))),
    (MSHOTS["Postulates"][0], MN("Postulates")),
    (W("For", 175.0) - 0.1, PO("euclid_class", EUC2, w=1000, h=760, line=-9, circle=-9,
                              cred=CR_PD("Oliver Byrne, The Elements of Euclid (1847)" if EUC2 == "byrne_euclid" else "Euclid's Elements, P. Oxy. I 29"))),
    (W("Hold", 179.7) - 0.15, MN("Postulates")),

    # ===================== THREE: ANGLES =====================
    (MSHOTS["Angles"][0], CHAP(CH("THREE"), "Angles", ("p", "string_circle", {"walk": -9}))),
    (W("meet", 186.2) - 0.7, MN("Angles")),
    (MSHOTS["Angles"][1], REAL("pxg_city", 1.0, ("p", "gps_street", {}), zoom=(1.0, 1.06),
                               ov=OV(KD("Our whole built world is full of right angles.", W("Our", 228.5), y=930, size=50)))),

    # ===================== FOUR: TRIANGLES =====================
    (MSHOTS["Rigid"][0], CHAP(CH("FOUR"), "Triangles", ("v", "pxg_bridge2", 1.0, "builder_corner", {}))),
    (W("join", 232.3) - 0.5, MN("Rigid")),
    (MSHOTS["Rigid"][1], REAL("pxg_bridge2", 3.0, ("p", "builder_corner", {}), zoom=(1.0, 1.08))),
    (W("electricity", 271.3) - 0.2, REAL("pxg_pylon", 1.0, ("p", "builder_corner", {}), zoom=(1.0, 1.08))),
    (W("They're", 274.9) - 0.1, REAL("pxg_bridge", 6.0, ("p", "builder_corner", {}), zoom=(1.08, 1.0),
                                    ov=OV(KD("triangles keep everything rigid", W("triangles", 275.5), y=930, size=52)))),
    (MSHOTS["AngleSum"][0], MN("AngleSum")),

    # ===================== FIVE: PYTHAGORAS =====================
    (MSHOTS["Pythag"][0], CHAP(CH("FIVE"), "The most famous rule", ("p", "builder_corner", {"three": -9, "four": -9, "five": -9}))),
    (W("right", 308.7) - 0.5, MN("Pythag")),
    (MSHOTS["Pythag"][1], PERSON([("pythagoras", "Pythagoras", "Greek thinker, about 2,500 years ago", W("Pythagoras", 357.7), None)],
                                 ("p", "euclid_class", {"line": -9, "circle": -9}), cred="Bust: Capitoline Museums, photo Cmick25, CC BY-SA 4.0")),
    (W("Clay", 365.1) - 0.2, PO("euclid_class", "plimpton322", w=1100, h=760, line=-9, circle=-9,
                               ov=PL("BABYLON", "more than 1,000 years before him", W("Clay", 365.1)), cred=CR_PD("Plimpton 322, Columbia University"))),
    (W("And", 370.8) - 0.1, P("altar_ropes", ropes=0.3, bricks=R("rules", 374.3), fire=R("same", 377.7), cam=Z(),
                             ov=OV(PL("INDIA", "the Baudhayana Sulbasutra", W("Baudhayana", 370.9)),
                                   KD("usually dated between 800 and 500 BC", W("dated", 379.4), y=930, size=48)))),
    (W("Ropes", 383.8) - 0.1, P("rope_stretchers", stretch=-9, peg=-9, mark=-9, cam=Z(1.05, 1.12))),
    (MSHOTS["TV"][0], MN("TV")),
    (MSHOTS["TV"][1], P("builder_corner", three=R("three", 406.4), four=R("four", 406.4), five=R("five", 411.6), cam=Z(1.0, 1.06))),

    # ===================== SIX: CIRCLES AND PI =====================
    (W("Now", 414.4) - 0.1, CHAP(CH("SIX"), "Circles and pi", ("p", "string_circle", {"walk": 99}))),
    (W("Pin", 416.9) - 0.1, P("string_circle", walk=R("walk", 419.1), cam=Z(1.0, 1.06))),
    (MSHOTS["CircleDef"][0], MN("CircleDef")),
    (MSHOTS["CircleDef"][1], REAL("pxg_wheel", 1.0, ("p", "string_circle", {}), zoom=(1.0, 1.06))),
    (W("full", 430.5) - 0.3, REAL("pxg_moon", 1.0, ("p", "string_circle", {}), zoom=(1.0, 1.08))),
    (MSHOTS["PiScene"][0], MN("PiScene")),
    (MSHOTS["Archimedes"][0], MN("Archimedes")),
    (W("Archimedes", 458.8) - 0.4, PERSON([("archimedes", "Archimedes", "Greek mathematician, around 250 BC", W("Archimedes", 458.8), None)],
                                          ("p", "string_circle", {"walk": -9}), cred=CR_PD("Domenico Fetti, 1620 (imagined portrait)"))),
    (W("trapped", 462.6) - 0.45, MN("Archimedes")),

    # ===================== SEVEN: WHEN SHAPES GROW =====================
    (MSHOTS["Archimedes"][1], CHAP(CH("SEVEN"), "When shapes grow", ("p", "pizza_order", {"open": -9}))),
    (W("Imagine", 490.8) - 0.1, P("pizza_order", open=R("eat", 497.2), cam=Z(1.0, 1.08))),
    (MSHOTS["Pizza"][0], MN("Pizza")),
    (MSHOTS["Cube"][0], MN("Cube")),
    (MSHOTS["Cube"][1], PERSON([("galileo", "Galileo Galilei", "astronomer and physicist", W("Galileo", 537.0), None)],
                               ("v", "pxg_elephant", 2.0, "giant_ant", {}), cred=CR_PD("Justus Sustermans, 1636"))),
    (W("Have", 542.9) - 0.1, P("giant_ant", grow=0.4, collapse=99, cam=Z(1.0, 1.06))),
    (MSHOTS["AntScale"][0], MN("AntScale")),
    (MSHOTS["AntScale"][1], P("giant_ant", grow=-9, collapse=0.3, cam=Z(1.05, 1.12))),
    (W("That's", 565.6) - 0.1, REAL("pxg_elephant", 1.0, ("p", "giant_ant", {}), zoom=(1.0, 1.06))),
    (W("While", 568.8) - 0.1, REAL("pxg_spider", 1.0, ("p", "giant_ant", {}), zoom=(1.0, 1.06))),
    (W("the", 572.2) - 0.1, REAL("pxg_elephant", 8.0, ("p", "giant_ant", {}), zoom=(1.06, 1.0),
                                ov=OV(KD("the bigger the animal, the thicker its legs", W("bigger", 572.4), y=930, size=50)))),
    (W("Nature", 576.3) - 0.1, REAL("pxg_honey", 1.0, ("p", "giant_ant", {}), zoom=(1.0, 1.08),
                                   ov=OV(KD("six-sided cells: hexagons", W("hexagons", 579.5), y=930, size=52)))),
    (MSHOTS["Hexagons"][0], MN("Hexagons")),
    (MSHOTS["Hexagons"][1], REAL("pxg_honey", 8.0, ("p", "giant_ant", {}), zoom=(1.08, 1.0))),

    # ===================== EIGHT: MEASURING THE EARTH =====================
    (W("So", 607.3) - 0.1, CHAP(CH("EIGHT"), "Measuring the Earth", ("v", "pxg_earth", 2.0, "syene_well", {}))),
    (W("Around", 614.6) - 0.1, PERSON([("eratosthenes", "Eratosthenes", "chief librarian, Library of Alexandria", W("Eratosthenes", 619.2), None)],
                                     ("p", "euclid_class", {"line": -9, "circle": -9}), place_=("ALEXANDRIA", "around 240 BC", W("240", 614.6)),
                                     cred="Imagined portrait, public domain")),
    (W("He", 622.3) - 0.1, REAL("pxg_nile", 6.0, ("p", "syene_well", {}), zoom=(1.0, 1.06), ov=PL("SYENE", "known today as Aswan", W("Syene", 622.3)))),
    (W("Once", 628.3) - 0.1, P("syene_well", sun=R("sunlight", 631.1), measure=R("upright", 638.2), cam=Z(1.0, 1.06))),
    (MSHOTS["EraRays"][0], MN("EraRays")),
    (W("To", 684.4) - 0.1, P("walkers", walk=0.3, cam=Z(1.0, 1.06))),
    (W("Syene", 690.1) - 0.1, MN("EraRays")),
    (MSHOTS["EraRays"][1], REAL("pxg_desert", 1.0, ("p", "syene_well", {}), zoom=(1.0, 1.08),
                                ov=OV(KD("a stick, a shadow, and a planet", W("stick", 711.2), y=930, size=52)))),
    (W("A", 715.9) - 0.1, REAL("pxg_earth", 4.0, ("p", "syene_well", {}), zoom=(1.0, 1.06))),

    # ===================== NINE: THE RULE THAT CAUSED TROUBLE =====================
    (MSHOTS["Parallel"][0], CHAP(CH("NINE"), "The troublesome rule", ("v", "pxg_rail", 2.0, "bolyai_letter", {}))),
    (W("It's", 722.0) - 0.15, MN("Parallel")),
    (W("railway", 724.2) - 0.3, REAL("pxg_rail", 3.0, ("p", "bolyai_letter", {}), zoom=(1.0, 1.06))),
    (W("Roughly", 729.7) - 0.15, MN("Parallel")),
    (MSHOTS["Parallel"][1], P("bolyai_letter", write=R("Farkas", 761.5), read=R("Janos", 770.2), cam=Z(1.0, 1.08),
                              ov=OV(PL("HUNGARY", "early 1800s", W("1800s", 752.0)), KD("He begged his son to stop.", W("begging", 761.5), y=930, size=52)))),
    (MSHOTS["WhatIf"][0], MN("WhatIf")),
    (MSHOTS["WhatIf"][1], PERSON([("lobachevsky", "Nikolai Lobachevsky", "Russia", W("Nikolai", 788.7), None),
                                  ("gauss", "Carl Friedrich Gauss", "Germany", W("Gauss", 793.2), None)],
                                 ("p", "bolyai_letter", {"write": -9, "read": -9}), cred=CR_PD("portraits"))),

    # ===================== TEN: CURVED SPACE =====================
    (MSHOTS["GlobeTri"][0], CHAP(CH("TEN"), "Curved space", ("v", "pxg_earth", 5.0, "syene_well", {}))),
    (W("Take", 804.1) - 0.1, MN("GlobeTri")),
    (MSHOTS["Flight"][0], MN("Flight")),
    (MSHOTS["Spacetime"][0], MN("Spacetime", ov=PORT("einstein", "Albert Einstein", "physicist", W("Albert", 856.0), cred=CR_PD("photo F. Schmutzer, 1921")))),

    # ===================== ELEVEN: IN YOUR POCKET =====================
    (MSHOTS["Spacetime"][1], CHAP(CH("ELEVEN"), "Geometry in your pocket", ("p", "gps_street", {"sats": -9, "pin": -9}))),
    (W("When", 881.7) - 0.1, REAL("pxg_sat", 1.0, ("p", "gps_street", {}), zoom=(1.0, 1.06))),
    (W("satellites", 882.9) + 1.6, P("gps_street", sats=0.2, pin=99, cam=Z(1.0, 1.08))),
    (MSHOTS["GPS"][0], MN("GPS")),
    (MSHOTS["Finale"][0], MN("Finale")),

    # ===================== ENDING =====================
    (MSHOTS["Finale"][1], REAL("pxg_nile", 10.0, ("p", "nile_flood", {}), zoom=(1.0, 1.06))),
    (W("all", 949.1) - 0.1, REAL("pxg_earth", 7.0, ("p", "syene_well", {}), zoom=(1.0, 1.06))),
    (W("The", 951.7) - 0.1, REAL("pxg_bridge2", 6.0, ("p", "builder_corner", {}), zoom=(1.0, 1.06))),
    (W("pizza", 952.9) - 0.1, REAL("pxg_pizza", 2.0, ("p", "pizza_order", {}), zoom=(1.0, 1.06))),
    (W("It", 957.5) - 0.1, P("rope_stretchers", stretch=0.2, peg=99, mark=99, cam=Z(1.0, 1.06))),
    (W("It", 961.0) - 0.1, REAL("pxg_earth", 9.0, ("p", "syene_well", {}), zoom=(1.0, 1.1))),
]
