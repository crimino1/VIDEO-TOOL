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


def REF(items, last, kind="cabinet", extra=None, **o):
    """Chapter refrain ('No brain. No plan. / Still computing.') over a dimmed pixel scene."""
    def f(a, b):
        o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
        pxshot(a, b, kind, o)
        its = [(t_, W(w_, aft)) for t_, w_, aft in items]
        tl_ = W(last[1], last[2])
        layer(a, b, scrim(0.62) + refrain(its, last[0], tl_) + (extra(a, b) if extra else ""))
        _fx([("pop", its[0][1], 0.35), ("notif", tl_, 0.4)], a)
    return f


def MB(kind, poses, side="left", sub_=None, op=0.72, **o):
    """Mascot over a dimmed pixel backdrop."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "zoom")
    def f(a, b):
        pxshot(a, b, kind, o)
        layer(a, b, scrim(op))
        M(poses, side, sub_)(a, b)
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
NO = lambda n: f"LIVING COMPUTER &nbsp;&middot;&nbsp; No. {n}"
SLIME_TL = ("v", "cm_slime_10h", 4.0)
CR_TIMTIM = "Video: Tim Tim (VD fr), CC BY-SA 4.0, via Wikimedia Commons"
CR_TOKYO = "Video: Tero et al., Science 2010 (Fig. 1 movie)"
CR_DISH = "Kagan et al., Neuron 2022, CC BY 4.0"

SHOTS = [
    # ===================== COLD OPEN =====================
    ("0:00.00", P("two_worlds", left=0.4, right=R("biology", 0), tin="fade", fin=0.8, cam={"z": [1.0, 1.06]},
                  ov=OV(K("Computer science", 0.0, y=120, size=84), K("and biology", W("biology", 0) - 0.2, y=220, size=84, col="#e0b23a")),
                  fx=[("whoosh", 0.1, 0.35)])),
    ("0:05.36", REAL("pxb_cpu_pins", 1.0, ("p", "two_worlds", {"left": -1, "right": 99}), zoom=(1.12, 1.0),
                     ov=OV(KD("Silicon. Electricity. Clean rooms.", W("silicon", 5), y=900, size=60)))),
    ("0:09.94", REAL("cm_slime_timelapse", 6.0, ("p", "log_macro", {}), ov=OV(KD("Wet. Messy. Slimy.", W("wet", 9.5), y=900, size=60)), cred=CR_TIMTIM)),
    ("0:14.10", P("def_machine", **{"in": R("takes", 17)}, rules=R("follows", 18), out=R("answer", 20), cam={"z": [1.0, 1.1]},
                  ov=OV(K("A computer is anything that", W("computer", 17), y=60, size=58, end=W("takes", 17) + 2.6)),
                  fx=[("click", W("takes", 17), 0.45), ("click", W("answer", 20), 0.4)])),
    ("0:22.88", P("alive_reveal", open=R("alive", 25, -0.3), cam={"z": [1.0, 1.15]},
                  ov=OV(K("...are alive.", W("alive", 25), y=880, size=86)), fx=[("whoosh", W("alive", 25) - 0.3, 0.4)])),
    ("0:28.14", P("logo2", done=1.4, tin="glitch", filter="saturate(0.5) sepia(0.12)", fx=[("glitch", 28.14, 0.5), ("impact", 29.4, 0.45)])),
    ("0:30.62", P("cabinet", lit=[R("five", 30), R("five", 30, 0.5), R("five", 30, 1.0), R("five", 30, 1.5), R("five", 30, 2.0)],
                  cam={"z": [1.0, 1.08]}, ov=OV(K("Five living computers", W("five", 30), y=70, size=78)),
                  fx=[("pop", W("five", 30) + i * 0.5, 0.25) for i in range(5)])),
    ("0:35.86", REAL("pxb_forest_log", 2.0, ("p", "log_macro", {}), zoom=(1.0, 1.08))),
    (W("called", 39) - 0.1, CHAP(NO(1), "The blob that plans railways", SLIME_TL + ("p", "log_macro", {}), sci="Physarum polycephalum", credit_=CR_TIMTIM)),
    ("0:44.30", REAL("cm_slime_growth", 3.0, ("p", "one_cell", {}), zoom=(1.0, 1.08), cred=CR_TIMTIM, ov=OV(KD("A bright yellow blob", W("bright", 44), y=900, size=58)))),
    (W("whole", 45) - 0.1, P("one_cell", label=R("cell", 46), cam={"z": [1.0, 1.1]}, fx=[("pop", W("cell", 46), 0.35)])),
    ("0:48.50", P("no_brain", x=[R("brain", 48), R("neurons", 49), R("eyes", 50)], maze=R("maze", 51),
                  fx=[("click", W("brain", 48), 0.35), ("click", W("neurons", 49), 0.35), ("click", W("eyes", 50), 0.35)])),
    ("0:54.14", P("maze_solve", spread=[R("spreads", 56), R("once", 58)], retract=[R("pulls", 60), R("shortest", 64)], cam={"z": [1.0, 1.12]},
                  ov=OV(KD("Every corridor at once", W("every", 57), y=930, size=56, end=W("pulls", 60)),
                        KD("One tube. The shortest path.", W("one", 64), y=930, size=56)))),
    (W("2010", 67) - 0.2, PERSON([("tero", "Atsushi Tero", "Mathematician, Hokkaido University", W("researchers", 68), None),
                                  ("nakagaki", "Toshiyuki Nakagaki", "Biologist, Hokkaido University", W("Japan", 69), None)],
                                 ("v", "yt_tokyo", 0.5, "oat_map", {"oats": [-9, -8]}), place_=("HOKKAIDO UNIVERSITY &middot; SAPPORO, JAPAN", "2010", W("2010", 67)), cred=CR_TOKYO)),
    ("1:12.52", P("oat_map", oats=[R("oat", 72), R("36", 77)], slime=R("put", 79), grow=None, lights=99, cam={"z": [1.0, 1.1]},
                  ov=OV(KD("36 cities around Tokyo", W("36", 77), y=930, size=56)), fx=[("pop", W("oat", 72), 0.3), ("pop", W("36", 77), 0.35)])),
    ("1:22.62", P("oat_map", oats=[-9, -8], slime=-8, lights=R("light", 82), grow=99.0, cam={"z": [1.08, 1.0]},
                  ov=OV(KD("Light = mountains and lakes", W("light", 82) + 0.5, y=930, size=52, end=W("waited", 88) - 0.2)),
                  fx=[("click", W("light", 82), 0.4)])),
    (W("waited", 88) - 0.15, FV("oat_map", "yt_tokyo", 2.0, frame=(960, 470, 1000), speed=5.0, crop=(0.03, 0.0, 1.0, 1.0), cred=CR_TOKYO, oats=[-9, -8], slime=-8, grow=None, state="net",
                                 ov=OV(KD("About a day later", W("day", 89), y=930, size=54, end=W("looked", 91)), KD("...the Tokyo rail network", W("Tokyo", 92), y=930, size=54)))),
    (W("when", 93.5) - 0.1, P("rail_compare", overlay=0.3, m1=R("cost", 96), m2=R("efficiency", 97), m3=R("survives", 100), cut=R("broken", 101),
                  fx=[("whoosh", W("looked", 91), 0.35), ("click", W("cost", 96), 0.3), ("click", W("efficiency", 97), 0.3), ("click", W("survives", 100), 0.3)])),
    ("1:43.20", REAL("pxb_shinkansen", 1.0, ("p", "rail_compare", {"overlay": -5}), ov=OV(KD("One of the most engineered rail systems on earth", W("engineered", 104), y=900, size=50)))),
    (W("blob", 106) - 0.3, P("oat_gag", cam={"z": [1.1, 1.18]})),
    ("1:49.94", MB("tube_rule", [(None, "scratch"), (W("rule", 111), "point")], "left", thick=99, thin=99, gone=99, local=99,
                   sub_=[("So how?", ["One embarrassingly", "simple rule"], None, None)])),
    ("1:54.08", P("tube_rule", thick=R("thicker", 114), thin=R("thinner", 118), gone=R("disappears", 120), local=99.0, cam={"z": [1.0, 1.1]})),
    ("2:02.62", P("tube_rule", thick=-9, thin=-9, gone=-9, local=R("knows", 123), cam={"z": [1.2, 1.05]},
                  ov=OV(KD("No part knows the whole map", W("knows", 123), y=930, size=56)))),
    ("2:10.42", P("model_sim", cam={"z": [1.0, 1.12]}, ov=OV(KD("Turned into a mathematical model", W("mathematical", 131), y=930, size=54)))),
    ("2:16.70", REF([("No brain.", "brain", 136), ("No plan.", "plan", 137)], ("Still computing.", "computing", 138), focus=1,
                    check=[[1, R("computing", 138)]], lit=[-9, -9, -9, -9, -9])),
    ("2:20.56", P("slime_slow", cam={"z": [1.0, 1.08]}, ov=OV(KD("Slow. And you can't program it.", W("slow", 142), y=930, size=54)))),

    # ===================== 2. ADLEMAN, DNA COMPUTER =====================
    ("2:26.26", P("zoom_dna", tin="fade", ov=OV(KD("The molecule that stores life's instructions", W("molecule", 149), y=930, size=50)))),
    ("2:33.52", CHAP(NO(2), "The test tube that tries every answer", ("v", "pxb_tips_b", 1.0, "tube_chains", {}))),
    (W("Leonard", 155) - 0.4, PERSON([("adleman", "Leonard Adleman", "Computer scientist, USC", W("Leonard", 155), None)],
                                     ("v", "pxb_la", 2.0, "flight_map", {}), place_=("LOS ANGELES", "1994", W("Leonard", 155) + 0.6),
                                     cred="Photo: Leonard Adleman, CC BY-SA 3.0, via Wikimedia Commons")),
    ("2:39.34", P("flight_map", flights=[R("seven", 161), R("flights", 162)], rule=R("visits", 168), path=R("visits", 168, 0.6), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("A classic hard problem", W("classic", 159), y=930, size=56, end=W("seven", 161))),
                  fx=[("pop", W("seven", 161), 0.3), ("whoosh", W("visits", 168) + 0.6, 0.35)])),
    ("2:53.10", REAL("pxb_pipette_petri", 1.0, ("p", "dna_blocks", {"flights": 99}), ov=OV(KD("His idea was beautiful.", W("beautiful", 173), y=900, size=58)))),
    ("2:54.80", P("dna_blocks", flights=R("flight", 179), cam={"z": [1.0, 1.08]},
                  fx=[("pop", W("city", 175), 0.3), ("click", W("flight", 179), 0.35)])),
    ("3:03.82", REAL("pxb_tips_b", 3.0, ("p", "tube_chains", {"link": [99, 100]}), ov=OV(KD("Pour everything into a test tube", W("pour", 184), y=900, size=56)))),
    ("3:06.92", P("tube_chains", link=[R("bump", 189), R("seconds", 194)], right=R("right", 198), cam={"z": [1.0, 1.14]},
                  ov=OV(KD("Every chain is a possible route", W("chain", 192), y=930, size=54, end=W("right", 198))),
                  fx=[("notif", W("right", 198), 0.4)])),
    ("3:22.32", P("serial_parallel", left=R("normal", 203), right=R("test", 206), fx=[("click", W("normal", 203), 0.3), ("whoosh", W("test", 206), 0.35)])),
    ("3:32.18", P("lab_week", days=[R("week", 214, -0.8), R("week", 216)], paper=R("puzzle", 218), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("About a week of lab work", W("week", 214), y=60, size=56, end=W("paper", 218))))),
    ("3:41.74", P("dna_vs_earth", cities=R("200", 224), tip=R("outweigh", 227), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("And it scales terribly", W("scales", 222), y=60, size=56)), fx=[("impact", W("outweigh", 227), 0.4)])),
    ("3:49.80", REF([("No chip.", "chip", 229), ("No electricity.", "electricity", 230)], ("Still computing.", "computing", 231), focus=2,
                    check=[[1, -9], [2, R("computing", 231)]], lit=[-9, -9, -9, -9, -9],
                    extra=K("Just not very practical.", W("practical", 233) - 0.5, y=720, size=50, col="#aab0b6"))),

    # ===================== 3. DNA STORAGE =====================
    ("3:55.84", CHAP(NO(3), "The molecule that holds an OS", ("p", "file_bits", {"helix": -9}),
                     ov=OV(K("Not calculating.", W("calculating", 239), y=770, size=54, col="#aab0b6"), K("Remembering.", W("Remembering", 240), y=840, size=64, col="#e0b23a")))),
    ("4:02.18", P("bits_bases", four=R("four", 243), two=R("bits", 248), map=R("00", 250), cam={"z": [1.0, 1.08]},
                  fx=[("pop", W("four", 243), 0.3), ("click", W("bits", 248), 0.3)])),
    ("4:15.50", P("file_bits", bits=R("ones", 259), letters=R("letters", 263), helix=R("molecule", 266), cam={"z": [1.0, 1.12]},
                  fx=[("type", W("ones", 259), 0.4, 1.6), ("whoosh", W("molecule", 266), 0.35)])),

    # ---- part 3 starts 4:29.66
    ("4:29.66", REAL("pxb_nyc_night", 1.0, ("p", "order_vial", {"count": 99, "send": 99, "vial": 99}), zoom=(1.0, 1.06), ov=PL("NEW YORK", "2017", W("2017", 269.5)))),
    (W("two", 270) - 0.1, PO("order_vial", "erlich_zielinski_press", count=99, send=99, vial=99, w=1060, h=706, cx=960, cy=440, cred="Photo: New York Genome Center",
                             ov=OV(TAG("Yaniv Erlich", "Columbia University &amp; NY Genome Center", W("researchers", 270), x=200, y=830),
                                   TAG("Dina Zielinski", "New York Genome Center", W("researchers", 270) + 0.5, x=1060, y=830)))),
    ("4:37.56", P("order_vial", count=R("72", 278), send=R("order", 282), vial=R("vial", 285), cam={"z": [1.0, 1.1]},
                  fx=[("type", W("72", 278), 0.4, 1.5), ("whoosh", W("order", 282), 0.35), ("pop", W("vial", 285), 0.35)])),
    ("4:47.18", P("sequencer", load=0.4, done=R("Zero", 290), fx=[("notif", W("Zero", 290), 0.45)])),
    ("4:51.76", P("boot_mine", boot=R("booted", 291), party=R("celebrate", 294), fx=[("click", W("Minesweeper", 293), 0.35), ("pop", W("celebrate", 294), 0.3)])),
    ("4:56.34", P("gram_scale", pb=R("215", 299), gb=R("million", 304), clip=R("paperclip", 307), cam={"z": [1.0, 1.1]},
                  fx=[("pop", W("215", 299), 0.35), ("pop", W("million", 304), 0.3)])),
    ("5:10.12", P("deep_time", dna=R("hundreds", 312), hdd=R("hard", 315), fx=[("click", W("hard", 315), 0.3)])),
    ("5:17.42", P("price_tag", write=R("cost", 322, 0.5), read=R("read", 324, -0.5), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("That demo was 2 megabytes.", W("demo", 320), y=60, size=54)),
                  fx=[("click", W("write", 323), 0.35), ("click", W("read", 324), 0.35)])),
    ("5:26.84", P("fountain", lost=R("damaged", 326), rebuild=R("error", 329), phone=R("streaming", 334), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("Error-correcting codes", W("error", 329), y=60, size=56)))),
    ("5:37.16", REF([("No disk.", "disk", 337), ("No power.", "power", 338)], ("Still remembering.", "remembering", 339), focus=3,
                    check=[[1, -9], [2, -9], [3, R("remembering", 339)]], lit=[-9, -9, -9, -9, -9])),

    # ===================== 4. CELLO =====================
    ("5:40.94", MB("ecoli_in", [(None, "think"), (W("can", 346), "tada")], "left", **{"in": 99.0},
                   sub_=[("Can a cell", ["run a program?"], None, W("can", 346)), ("It can.", [], W("can", 346), None)])),
    ("5:47.00", CHAP(NO(4), "Bacteria that run compiled code", ("p", "verilog_ed", {"code": 99, "gate": 99, "compile": 99}))),
    (W("Cello", 349) - 1.4 if False else "5:50.30", PERSON([("voigt", "Christopher Voigt", "Synthetic biologist, MIT", W("team", 348) + 1.4, None)],
                     ("p", "verilog_ed", {"code": 99, "gate": 99, "compile": 99}), place_=("MIT &middot; CAMBRIDGE, MASSACHUSETTS", "2016", W("2016", 347) + 3.4), cred="Photo: U.S. Office of Naval Research (public domain)")),
    ("5:54.54", P("verilog_ed", code=R("Verilog", 355), gate=R("input", 360), compile=R("compile", 365), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("The language of chip designers", W("same", 356), y=60, size=54, end=W("input", 360) - 0.3)),
                  fx=[("type", W("Verilog", 355), 0.4, 3.0), ("click", W("compile", 365), 0.5)])),
    ("6:07.14", P("compile_dna", dna=R("DNA", 370), fx=[("whoosh", W("DNA", 370), 0.35)])),
    ("6:11.66", FV("ecoli_in", "cm_ecoli", 2.0, frame=(960, 470, 1180), grade="eq=saturation=0.7:contrast=1.02", cred="Video: Girgis et al., PLOS Genetics 2007, CC BY 2.5",
                     ov=OV(KD("Put it inside E. coli bacteria", W("coli", 374) - 0.6, y=900, size=56)))),
    (W("now", 375), P("ecoli_in", **{"in": 0.3}, cam={"z": [1.0, 1.1]}, ov=OV(KD("Now the bacteria run your logic", W("run", 376), y=930, size=54)))),
    ("6:18.18", P("cell_circuit", **{"in": R("sense", 379)}, gates=R("gates", 382), out=R("output", 385), cam={"z": [1.0, 1.08]},
                  fx=[("pop", W("oxygen", 380), 0.3), ("pop", W("sugar", 381), 0.3), ("click", W("gates", 382), 0.35), ("notif", W("output", 385), 0.35)])),
    ("6:28.68", P("plate60", end=R("45", 391), count=R("worked", 390), fx=[("click", W("45", 391), 0.35)])),
    ("6:34.24", P("my_code", cam={"z": [1.0, 1.1]}, fx=[("glitch", 395.0, 0.3)])),
    ("6:37.20", REAL("pxb_scope_stage", 1.0, ("p", "grow_prog", {}), ov=OV(KD("A cell that makes decisions", W("decisions", 399), y=900, size=56)))),
    ("6:40.64", P("tumor_drug", detect=R("detect", 403), cam={"z": [1.0, 1.08]}, fx=[("pop", W("detect", 403), 0.3)])),
    ("6:44.92", P("root_microbes", attack=R("attack", 409, -0.6), spray=R("attack", 409, 0.4), cam={"z": [1.0, 1.06]})),
    ("6:50.54", P("grow_prog", cam={"z": [1.0, 1.1]}, ov=OV(K("Programs you don't install.", W("Programs", 410), y=70, size=62),
                                                             K("You grow them.", W("grow", 412), y=150, size=62, col="#e0b23a")))),
    ("6:54.36", REF([("No keyboard.", "keyboard", 414), ("No screen.", "screen", 415)], ("Still running code.", "running", 416), focus=4,
                    check=[[1, -9], [2, -9], [3, -9], [4, R("running", 416)]], lit=[-9, -9, -9, -9, -9])),

    # ===================== 5. DISHBRAIN =====================
    ("6:58.70", P("cabinet", lit=[-9, -9, -9, -9, -9], focus=5, cam={"z": [1.0, 1.12]}, ov=OV(K("The strangest one", W("strangest", 419), y=70, size=70)))),
    ("7:01.32", PO("mea_chip", "dishbrain_neurons_stain", label=99, crop=(0.254, 0.012, 0.497, 0.216), w=760, h=760, cy=470, cred="Image: " + CR_DISH,
                     ov=OV(KD("Cells that evolved for it", W("evolved", 424), y=900, size=56)))),
    ("7:07.24", CHAP(NO(5), "The dish that learned Pong", ("v", "pxb_melb", 2.0, "dish_pong", {}),
                     ov=PL("CORTICAL LABS &middot; MELBOURNE, AUSTRALIA", "2022", W("company", 428)))),
    (W("grew", 429) - 0.2, FV("mea_chip", "yt_cl1", 88.6, frame=(960, 450, 1240), crop=(0.0, 0.06, 0.82, 0.80), label=99, cred="Video: Cortical Labs on YouTube",
                              ov=OV(TAG("Brett Kagan", "Chief Scientific Officer, Cortical Labs", W("grew", 429) + 0.3, x=110, y=830)))),
    (W("chip", 432) - 0.6, PO("mea_chip", "dishbrain_neurons_stain", label=99, crop=(0.52, 0.735, 0.998, 0.998), w=1200, h=660, cy=470, cred="Image: neurons on the electrode chip, " + CR_DISH,
                              ov=OV(KD("About 800,000 brain cells on a chip", W("800", 430), y=900, size=54)))),
    ("7:15.98", P("two_sources", mouse=R("mouse", 435), human=R("human", 438))),
    ("7:19.64", FV("dish_pong", "cm_pong169", 4.0, frame=(960, 520, 1060), cred="Video: the real DishBrain game, " + CR_DISH, sense=99, move=99,
                   ov=OV(K("DishBrain", W("dishbrain", 440), y=50, size=86)), fx=[("pop", W("Pong", 442), 0.35)])),
    ("7:24.06", P("dish_pong", sense=R("Electrodes", 445), move=R("firing", 449), cam={"z": [1.0, 1.1]})),
    ("7:32.24", P("feedback", hit=R("hit", 453), miss=R("missed", 457), adapt=R("changed", 464), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("Neurons don't like unpredictability", W("unpredictability", 460), y=60, size=54)),
                  fx=[("click", W("hit", 453), 0.3), ("glitch", W("missed", 457), 0.25)])),
    ("7:48.16", P("rally", cross=R("chance", 471), cam={"z": [1.0, 1.08]}, fx=[("notif", W("chance", 471), 0.35)])),
    ("7:52.56", P("kid_wins", cam={"z": [1.3, 1.36], "x": [372, 380], "y": [205, 205]}, ov=OV(KD("They never got good.", W("never", 472), y=60, size=56)))),
    ("7:56.50", P("dish_pong", sense=-9, move=-9, cam={"z": [1.15, 1.0]},
                  ov=OV(K("Nobody programmed those rallies.", W("nobody", 476), y=60, size=58), K("A dish of cells learned them.", W("dish", 478), y=140, size=58, col="#e0b23a")))),
    ("8:01.34", REAL("yt_cl1", 8.0, ("p", "mea_chip", {}), crop=(0.0, 0.09, 0.88, 1.0), cred="Video: Cortical Labs on YouTube",
                     ov=OV(KD("A computer built around living neurons", W("computer", 484), y=900, size=50), (lambda a_, b_: num("$35,000", W("35", 487), y=760))))),
    ("8:10.38", MB("power", [(None, "shrug"), (W("Power", 491), "point")], "left", brain=99.0, dc=99.0,
                   sub_=[("Why bother?", [], None, W("Power", 491)), ("Power.", [], W("Power", 491), None)])),
    ("8:12.66", P("power", brain=R("brain", 492), dc=R("Training", 497), cam={"z": [1.0, 1.06]})),
    (W("data", 499) - 0.6, REAL("pxb_dc_hall", 1.0, ("p", "power", {"brain": -9, "dc": 0.2}), ov=OV(KD("A whole data center", W("whole", 499), y=900, size=58)))),
    ("8:21.00", REF([("No data set.", "data", 501), ("No graphics card.", "graphics", 502)], ("Still learning.", "learning", 503), focus=5,
                    check=[[1, -9], [2, -9], [3, -9], [4, -9], [5, R("learning", 503)]], lit=[-9, -9, -9, -9, -9])),

    # ===================== RECAP + ENDING =====================
    ("8:25.14", P("maze_solve", state="end", cam={"z": [1.1, 1.0]}, ov=OV(KD("A blob that plans railways", W("blob", 505), y=930, size=54)))),
    ("8:28.12", P("tube_chains", link=[-9, -8], right=0.3, ov=OV(KD("A test tube that tries every answer", W("test", 508), y=930, size=54)))),
    ("8:31.60", P("order_vial", count=-9, send=-9, vial=0.2, ov=OV(KD("A molecule that holds an operating system", W("molecule", 511), y=930, size=50)))),
    ("8:34.54", P("cell_circuit", **{"in": -9}, gates=-9, out=0.3, ov=OV(KD("Bacteria that run compiled code", W("Bacteria", 514), y=930, size=54)))),
    ("8:37.22", P("dish_pong", sense=-9, move=-9, ov=OV(KD("A dish of neurons that plays Pong", W("neurons", 517), y=930, size=54)))),
    ("8:40.22", P("cabinet", lit=[-9, -9, -9, -9, -9], check=[[1, -9], [2, -9], [3, -9], [4, -9], [5, -9]], cam={"z": [1.12, 1.0]},
                  ov=OV(K("Not one needed a new kind of computer science", W("not", 522), y=70, size=56)))),
    ("8:46.16", P("textbook", items=[R("Shortest", 526), R("Parallel", 527), R("Error", 529), R("Logic", 530), R("Learning", 532)], same=R("weird", 537), cam={"z": [1.0, 1.1]},
                  fx=[("click", W("Shortest", 526), 0.3), ("click", W("Parallel", 527), 0.3), ("click", W("Error", 529), 0.3), ("click", W("Logic", 530), 0.3), ("click", W("Learning", 532), 0.3)])),
    ("8:57.36", P("weird_hw", cam={"z": [1.16, 1.24]}, ov=OV(K("The hardware got weird.", W("hardware", 537), y=70, size=62),
                                                             K("The ideas stayed the same.", W("ideas", 538), y=150, size=62, col="#e0b23a")))),
    ("9:01.52", MB("textbook", [(None, "point"), (W("Chips", 544), "shrug"), (W("ideas", 547), "tada")], "left", items=[-9, -9, -9, -9, -9], same=-9,
                   sub_=[("Learn the fundamentals", ["properly."], None, W("Chips", 544)), ("Chips will change.", ["Languages will change.", "The ideas are yours."], W("Chips", 544), None)])),
    ("9:10.14", P("oat_map", oats=[-9, -8], slime=-8, grow=None, build=0.3, cam={"z": [1.0, 1.14]},
                  ov=OV(KD("One small connection at a time", W("small", 553), y=930, size=56)))),
    ("9:15.50", MB("oat_map", [(None, "tada")], "left", oats=[-9, -8], slime=-8, state="net", sub_=[("Bit by bit.", [], None, None)])),
    ("9:16.88", DIMP("cabinet", op=0.35, lit=[-9, -9, -9, -9, -9], focus=1, focusAt=R("slime", 562), cam={"z": [1.0, 1.06]}, tout="fade", fout=1.2,
                     ov=OV(K("Subscribe to Bit by Bit", W("subscribe", 558), y=80, size=70),
                           K("Which one would you keep on your desk?", W("comments", 559), y=170, size=56, col="#e0b23a")),
                     fx=[("click", W("subscribe", 558), 0.45), ("notif", W("comments", 559), 0.35), ("pop", W("slime", 562), 0.3)])),
]
