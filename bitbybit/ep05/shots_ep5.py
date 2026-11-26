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



def RX(kind, img, crop=None, hl=None, w=1240, h=760, cx=960, cy=520, ov=None, cred=None, op=0.68, **o):
    """Receipt screenshot over a dimmed pixel scene; hl = (t, x0, y0, x1, y1) amber box in 0..1 image coords."""
    o.setdefault("tin", "fade"); o.setdefault("tout", "fade")
    def f(a, b):
        pxshot(a, b, kind, o)
        h_ = (s(hl[0]),) + tuple(hl[1:]) if hl else None
        layer(a, b, scrim(op) + shot_ss(a, b, img, crop, w=w, h=h, cx=cx, cy=cy, hl=h_) + (ov(a, b) if ov else "") + (credit(cred) if cred else ""))
        _fx([("whoosh", a - 0.05, 0.35)], a)
    return f


NO = lambda n: f"PIECE &nbsp;&middot;&nbsp; No. {n}"
CR_ATT = "Video: AT&amp;T Tech Channel on YouTube"
CR_WSJ = "Video: The Wall Street Journal on YouTube"

SHOTS = [
    # ===================== COLD OPEN =====================
    ("0:00.00", P("mic_myth", ear=0.3, off=R("listening", 1, -0.2), tin="fade", fin=0.8, cam={"z": [1.0, 1.08]},
                  ov=OV(K("Your phone is not listening to you.", 0.2, y=80, size=70)), fx=[("whoosh", 0.1, 0.3)])),
    ("0:02.44", MB("mic_myth", [(None, "shrug")], "left", ear=-9, off=-9, sub_=[("I know.", [], None, None)])),
    ("0:03.42", P("boots_talk", bubble=R("hiking", 5, -0.4), ad=R("hour", 7, 0.6), cam={"z": [1.0, 1.12]},
                  ov=OV(KD("An hour later...", W("hour", 7), y=930, size=56)), fx=[("notif", W("hour", 7) + 0.6, 0.4)])),
    ("0:09.86", REAL("pxb_man_phone_laugh", 1.0, ("p", "boots_talk", {"bubble": -9, "ad": -9}), ov=OV(KD("Everyone has that story.", W("Everyone", 9.5), y=900, size=58)))),
    ("0:11.76", REAL("pxb_crowd_cross", 1.0, ("p", "phone_wall", {}), zoom=(1.0, 1.06), ov=PL("NORTHEASTERN UNIVERSITY &middot; BOSTON", "2018", W("2018", 12)))),
    (W("researchers", 12.5) - 0.2, PERSON([("press_christo_wilson_northeastern", "Christo Wilson", "Northeastern University", W("researchers", 12.5), None),
                                           ("press_david_choffnes_northeastern", "David Choffnes", "Northeastern University", W("Northeastern", 13), None)],
                                          ("p", "phone_wall", {"count": 99, "zero": 99, "zero2": 99}), cred="Photos: Northeastern University")),
    ("0:17.16", P("phone_wall", count=R("17", 17), zero=R("microphone", 26), zero2=R("audio", 28.5), cam={"z": [1.0, 1.1]},
                  fx=[("click", W("17", 17), 0.3), ("click", W("microphone", 26), 0.35), ("click", W("audio", 28.5), 0.35)])),
    ("0:30.34", RX("phone_wall", "ss_panoptispy_no_audio_found", hl=(W("doesn't", 31), 0.0, 0.555, 1.0, 0.72), w=1100, h=800, count=-9, zero=-9, zero2=-9,
                   cred="Pan, Ren, Lindorfer, Wilson, Choffnes, PETS 2018")),
    ("0:34.26", P("crumbs", out=99, cam={"z": [1.0, 1.08]}, ov=OV(KD("They went looking, hard.", W("looking", 34), y=930, size=56)))),
    ("0:38.62", P("mic_myth", ear=-9, off=-9, cam={"z": [1.1, 1.22]},
                  ov=OV(K("If nothing was listening...", W("nothing", 40), y=80, size=66), K("how did it know?", W("how", 42), y=170, size=66, col="#e0b23a")))),
    ("0:44.08", P("crumbs", out=R("boots", 50), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("A few thousand tiny things you did", W("thousand", 48), y=930, size=54)), fx=[("notif", W("boots", 50), 0.4)])),
    ("0:53.74", P("dot_space", you=0.4, dims=99, near=99, videos=99, walk=99, cam={"z": [1.0, 1.1]},
                  ov=OV(K("One of the most elegant ideas", W("elegant", 55), y=80, size=62), K("in computer science.", W("computer", 56.5), y=160, size=62)))),
    ("0:58.30", P("mic_myth", ear=-9, off=-9, cam={"z": [1.15, 1.25]},
                  ov=OV(KD("It's also a little hard to sleep after.", W("sleep", 59), y=930, size=56)))),
    ("1:00.96", P("logo2", done=1.4, tin="glitch", filter="saturate(0.5) sepia(0.12)", fx=[("glitch", 60.96, 0.5), ("impact", 62.2, 0.45)])),
    ("1:03.18", P("dot_space", you=0.3, dims=99, near=1.5, videos=3.0, walk=4.0, cam={"z": [1.0, 1.08]},
                  ov=OV(K("Build a recommendation system", W("build", 63.5), y=80, size=64), K("one piece at a time", W("piece", 66), y=160, size=64, col="#e0b23a")))),
    ("1:08.94", REAL("pxb_feed_dark", 1.0, ("p", "ballot", {}), ov=OV(KD("What your feed knows about you", W("feed", 70), y=900, size=56)))),

    # ===================== PIECE 1: COLLABORATIVE FILTERING =====================
    ("1:14.12", CHAP(NO(1), "A spreadsheet of strangers", ("p", "big_sheet", {"rows": 99, "cols": 99, "ones": 99}))),
    ("1:16.26", P("big_sheet", rows=R("row", 77), cols=R("column", 79), ones=R("one", 82), cam={"z": [1.0, 1.1]},
                  fx=[("click", W("row", 77), 0.3), ("click", W("column", 79), 0.3), ("pop", W("one", 82), 0.3)])),
    ("1:25.70", P("twin_row", you=R("row", 86), twin=R("stranger", 90), same=R("Same", 97), extra=R("loved", 100), cam={"z": [1.0, 1.08]},
                  fx=[("click", W("stranger", 90), 0.3), ("click", W("Same", 97), 0.3), ("notif", W("recommendation", 103), 0.35)])),
    ("1:45.40", P("big_sheet", rows=-9, cols=-9, ones=-9, cam={"z": [1.15, 1.0]},
                  ov=OV(K("Collaborative filtering", W("collaborative", 105.5), y=80, size=78, col="#e0b23a")))),
    ("1:47.66", P("blind_clerk", q1=R("cooking", 116), q2=R("football", 118), q3=R("sadness", 119), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("It has no idea what any video is about", W("idea", 111), y=60, size=52)))),
    ("2:00.72", P("strangers", converge=R("same", 103 + 20.5), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("People who behave like you", W("behave", 121), y=930, size=56)))),
    ("2:05.22", REAL("pxb_crowd_top", 1.0, ("p", "strangers", {}), zoom=(1.0, 1.08), ov=OV(KD("A crowd of strangers who will never meet you", W("crowd", 126), y=900, size=52)))),
    ("2:09.48", P("big_sheet", rows=-9, cols=-9, ones=-9, cam={"z": [1.0, 1.15]},
                  ov=OV(KD("It's almost completely empty.", W("empty", 132), y=930, size=56)))),

    # ---- part 2 starts 2:13.58
    ("2:13.58", REAL("pxb_couch_think", 2.0, ("p", "sparse", {}), zoom=(1.0, 1.06), ov=PL("NETFLIX &middot; LOS GATOS, CALIFORNIA", "2006", W("2006", 134)))),
    (W("100", 137) - 0.4, P("sparse", c1=R("100", 137), c2=R("480", 139), c3=R("18", 142), empty=R("99", 147), cam={"z": [1.0, 1.12]},
                            fx=[("pop", W("100", 137), 0.3), ("pop", W("480", 139), 0.3), ("pop", W("18", 142), 0.3), ("click", W("99", 147), 0.35)])),
    ("2:32.44", P("no_twin", fail=R("twin", 155), cam={"z": [1.0, 1.08]}, ov=OV(KD("Nobody has seen most movies.", W("Nobody", 152), y=60, size=54)))),
    ("2:40.56", CHAP(NO(2), "The million-dollar contest", ("p", "big_cheque", {"cheque": 99, "banner": 99}))),
    ("2:43.06", PERSON([("cm_reed_hastings_2008", "Reed Hastings", "Netflix co-founder and CEO", W("million", 163), None)],
                       ("p", "big_cheque", {"cheque": -9, "banner": 99}), cred="Photo: JD Lasica, CC BY 2.0, via Wikimedia Commons")),
    ("2:44.98", P("big_cheque", cheque=-9, banner=R("Beat", 165), cam={"z": [1.0, 1.08]}, fx=[("whoosh", W("Beat", 165), 0.35)])),
    ("2:49.44", P("leaderboard", years=[R("three", 170), R("teams", 172)], teams=R("Thousands", 171), stuck=R("8", 174), cam={"z": [1.0, 1.1]},
                  fx=[("click", W("8", 174), 0.35)])),
    ("2:58.18", P("merge", m1=0.3, m2=R("again", 178), cam={"z": [1.0, 1.08]}, ov=OV(KD("Rival teams started merging", W("merging", 177), y=930, size=54)))),
    ("2:59.74", RX("leaderboard", "ss_netflix_prize_leaderboard_top2", hl=(W("identical", 182), 0.0, 0.18, 1.0, 0.32), w=1300, h=600, years=-9, teams=-9, stuck=-9,
                   cred="Netflix Prize leaderboard, via archive.org")),
    ("3:05.16", P("photo_finish", finish=R("20", 187), win=R("earlier", 188), cam={"z": [1.0, 1.08]}, fx=[("click", W("20", 187), 0.35)])),
    (W("idea", 190) - 0.3, FV("big_cheque", "yt_att_netflix_prize", 393.5, frame=(960, 470, 1100), cred=CR_ATT, cheque=-9, banner=-9,
                             ov=OV(TAG("Robert Bell &amp; Chris Volinsky", "BellKor's Pragmatic Chaos, 2009", W("idea", 190) + 0.3, x=110, y=830)))),

    # ===================== PIECE 3: SHRINK IT =====================
    ("3:14.80", CHAP(NO(3), "Shrink the spreadsheet", ("p", "shrink", {"shrink": 99, "label": 99}))),
    ("3:17.84", P("shrink", shrink=[R("Shrink", 197), R("person", 200)], label=R("50", 203), cam={"z": [1.0, 1.08]}, fx=[("whoosh", W("Shrink", 197), 0.35)])),
    ("3:26.94", P("dot_product", pairs=[R("line", 208), R("pair", 211)], big=R("Big", 214), small=R("Small", 216), cam={"z": [1.0, 1.08]},
                  fx=[("click", W("multiply", 210), 0.3), ("notif", W("Big", 214), 0.35), ("click", W("Small", 216), 0.35)])),
    ("3:38.08", P("nudge", random=R("random", 222), nudge=R("nudges", 225), billions=R("Billions", 234), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("Nobody writes them.", W("writes", 220.5), y=60, size=56, end=W("random", 222) + 1)))),
    ("3:56.06", MB("nudge", [(None, "point"), (W("meant", 240), "tada")], "left", random=-9, nudge=-9, billions=-9,
                   sub_=[("Here's the part", ["I find wild"], None, None)])),
    ("3:58.66", RX("axes", "ss_koren_fig3_netflix_factors", w=900, h=840, a1=99, a2=99, a3=99, nobody=99,
                   cred="Koren, Bell &amp; Volinsky, IEEE Computer 2009 (real factors from the Netflix data)")),
    ("4:03.76", P("axes", a1=R("serious", 244), a2=R("kids", 247), a3=R("explosions", 251), nobody=R("Nobody", 255), cam={"z": [1.0, 1.08]},
                  fx=[("click", W("serious", 244), 0.3), ("click", W("kids", 247), 0.3), ("click", W("explosions", 251), 0.3)])),
    ("4:24.30", P("dot_space", you=R("point", 266), dims=R("50", 268), near=R("People", 271), videos=R("Videos", 274), walk=R("walking", 278), cam={"z": [1.0, 1.1]},
                  fx=[("pop", W("point", 266), 0.35)])),

    # ---- part 3 starts 4:41.50
    ("4:41.50", REAL("pxb_racks", 2.0, ("p", "dot_moves", {}), zoom=(1.0, 1.08), ov=OV(KD("Somewhere on a server, there's a dot that is you.", W("server", 282), y=900, size=52)))),
    ("4:45.12", P("dot_moves", moves=0.3, cam={"z": [1.0, 1.12]}, ov=OV(KD("It moves every time you do anything.", W("moves", 285), y=930, size=54)))),

    # ===================== PIECE 4: HESITATION =====================
    ("4:48.34", CHAP(NO(4), "Your hesitation is a vote", ("p", "bot_farm", {"count": 99, "dog": 99, "dance": 99, "astro": 99, "nosearch": 99}))),
    ("4:54.84", REAL("pxb_bench_phones", 2.0, ("p", "bot_farm", {}), zoom=(1.0, 1.06), ov=PL("THE WALL STREET JOURNAL &middot; NEW YORK", "2021", W("2021", 295)))),
    (W("built", 299) - 0.2, P("bot_farm", count=R("100", 300), dog=R("Dogs", 305), dance=R("Dancing", 306), astro=R("Astrology", 307), nosearch=R("searched", 309), cam={"z": [1.0, 1.08]},
                              fx=[("pop", W("100", 300), 0.3), ("click", W("Dogs", 305), 0.3), ("click", W("Dancing", 306), 0.3), ("click", W("Astrology", 307), 0.3)])),
    ("5:12.94", P("linger", linger=0.4, figured=R("figured", 318), clock=R("two", 320), cam={"z": [1.0, 1.1]},
                  ov=OV(KD("They only paused a little longer", W("pause", 313), y=60, size=54, end=W("figured", 318))))),
    ("5:23.88", P("ballot", label=R("hesitation", 326), votes=0.5, cam={"z": [1.22, 1.3], "x": [300, 300], "y": [190, 190]},
                  ov=OV(KD("You can't really lie with your attention.", W("attention", 330), y=60, size=52)))),

    # ===================== PIECE 5: WATCH TIME =====================
    ("5:38.04", CHAP(NO(5), "Two stages and one number", ("p", "two_stage", {"s1": 99, "s2": 99, "watch": 99}))),
    (W("paper", 347) - 1.4, RX("two_stage", "ss_youtube_paper_page1", hl=(W("paper", 347), 0.02, 0.02, 0.98, 0.26), w=1050, h=760, s1=99, s2=99, watch=99,
                               cred="Covington, Adams, Sargin, RecSys 2016",
                               ov=PL("YOUTUBE &middot; SAN BRUNO, CALIFORNIA", "2016", W("2016", 349)))),
    ("5:51.94", P("two_stage", s1=R("rough", 352), s2=R("slow", 359), watch=R("watch", 365), cam={"z": [1.0, 1.08]})),
    ("6:07.40", P("clickbait", leave=R("clickbait", 370, -0.8), cross=R("target", 372), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("Clicks reward clickbait.", W("clickbait", 370), y=60, size=56)))),
    ("6:14.40", P("seventy", gate=R("YouTube", 376), pct=R("70", 377), cam={"z": [1.0, 1.06]})),
    (W("70", 377) + 1.2, RX("seventy", "ss_cnet_2018_70_percent", w=1150, h=560, gate=-9, pct=-9, cred="CNET, January 2018 (Neal Mohan, YouTube)")),

    # ===================== THE CREEPY PART =====================
    ("6:22.46", MB("dot_space", [(None, "scratch"), (W("creepy", 384), "point")], "left", you=-9, dims=-9, near=-9, videos=99, walk=99,
                   sub_=[("Okay.", ["Now the creepy part."], None, None)])),
    ("6:25.56", P("neighborhood", cam={"z": [1.0, 1.1]}, ov=OV(KD("Things you never told anyone", W("never", 388), y=930, size=56)))),
    ("6:31.82", REAL("pxb_kings", 2.0, ("p", "volunteers", {}), zoom=(1.0, 1.06), ov=PL("CAMBRIDGE &amp; STANFORD", "2015", W("2015", 392)))),
    (W("tested", 394) - 0.2, PERSON([("cm_kosinski_2019", "Michal Kosinski", "Psychologist, Stanford", W("tested", 394), None),
                                     ("press_david_stillwell_cambridge_jbs", "David Stillwell", "Psychometrics Centre, Cambridge", W("tested", 394) + 0.5, None)],
                                    ("p", "volunteers", {"test": 99, "likes": 99, "count": 99}),
                                    cred="Photos: Adrian Grycuk, CC BY-SA 3.0 PL, via Wikimedia Commons; University of Cambridge")),
    (W("86", 396) - 0.3, P("volunteers", count=R("86", 396), test=R("personality", 400), likes=R("liked", 404), cam={"z": [1.0, 1.08]})),
    ("6:48.16", P("judge_ladder", s1=R("10", 408), s2=R("70", 413), s3=R("150", 416), s4=R("300", 419), cam={"z": [1.0, 1.1]},
                  fx=[("click", W("10", 408), 0.3), ("click", W("70", 413), 0.3), ("click", W("150", 416), 0.3), ("notif", W("300", 419), 0.35)])),
    ("7:03.26", RX("judge_ladder", "ss_pnas_fig2_likes_vs_judges", w=1100, h=620, s1=-9, s2=-9, s3=-9, s4=-9, cred="Youyou, Kosinski, Stillwell, PNAS 2015")),

    # ---- part 4 starts 7:09.78
    ("7:09.78", MB("inside_machine", [(None, "think"), (W("arithmetic", 439), "shrug")], "left", open=99, garbage=99, sums=99,
                   sub_=[("To be fair:", ["it doesn't", "understand you"], None, None)])),
    ("7:16.56", P("inside_machine", open=R("person", 437), garbage=R("garbage", 443), cam={"z": [1.0, 1.08]},
                  fx=[("glitch", W("garbage", 443), 0.25)])),
    ("7:24.86", P("two_lists", l1=R("keep", 448), l2=R("glad", 451), measure=R("measured", 456), cam={"z": [1.0, 1.08]})),
    ("7:38.86", FV("sad_feed", "yt_wsj_tiktok", 148.0, frame=(960, 470, 1150), crop=(0.0, 0.12, 0.86, 1.0), cred=CR_WSJ, sad=-9, clock=99,
                   ov=OV(KD("One bot lingered on sad videos", W("sad", 461), y=900, size=54)))),
    (W("36", 464) - 0.6, P("sad_feed", sad=[0.2, 2.5], clock=R("36", 464), cam={"z": [1.0, 1.08]},
                           ov=OV(KD("Nothing was broken.", W("broken", 469), y=60, size=56)))),

    # ===================== WHAT YOU CAN DO =====================
    ("7:54.06", P("controls", b1=R("interested", 480.5), b2=R("pausing", 487), b3=R("Searching", 491), b4=R("finish", 496), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("You're the one doing the training.", W("training", 478), y=60, size=54, end=W("interested", 480.5) + 0.4)),
                  fx=[("click", W("interested", 480.5), 0.4), ("click", W("pausing", 487), 0.35), ("click", W("Searching", 491), 0.35), ("click", W("finish", 496), 0.4)])),
    ("8:18.06", P("dot_moves", moves=[0.2, 2.6], cam={"z": [1.1, 1.2]}, ov=OV(K("Finishing is the loudest signal there is.", W("loudest", 498), y=80, size=58)))),
    ("8:20.90", P("explore", odd=R("random", 504), search=R("question", 511), label=R("exploring", 519), scroll=R("Scroll", 520), cam={"z": [1.0, 1.08]},
                  ov=OV(KD("The woodworking one?", W("woodworking", 506), y=60, size=56, end=W("mistake", 509) + 1)))),

    # ===================== BACK TO THE BOOTS =====================
    ("8:43.76", REAL("pxb_boot_step", 7.0, ("p", "boots_talk", {"bubble": -9, "ad": -9}), zoom=(1.0, 1.08), ov=OV(KD("Nobody heard you say it.", W("Nobody", 526), y=900, size=58)))),
    ("8:48.04", P("wifi_morning", friend=0.3, wifi=R("Wi", 531), pause=R("paused", 532), spring=R("spring", 537), cam={"z": [1.0, 1.08]},
                  fx=[("click", W("paused", 532), 0.3), ("notif", W("spring", 537), 0.35)])),
    ("8:58.80", REAL("pxb_hikers", 1.0, ("p", "dot_space", {}), zoom=(1.0, 1.06),
                     ov=OV(K("Your phone isn't listening.", W("listening", 539), y=80, size=66),
                           K("It's paying attention.", W("paying", 540), y=170, size=66, col="#e0b23a")))),
    ("9:05.48", MB("dot_space", [(None, "tada")], "left", you=-9, dims=99, near=-9, videos=-9, walk=99, sub_=[("Bit by bit.", [], None, None)])),
    ("9:09.84", DIMP("neighborhood", op=0.3, you=-9, near=-9, sync=R("algorithm", 551), tout="fade", fout=1.2, cam={"z": [1.0, 1.08]},
                     ov=OV(K("Subscribe to Bit by Bit", W("subscribe", 554), y=80, size=70),
                           K("What's the strangest thing your feed got right?", W("strangest", 558), y=170, size=54, col="#e0b23a")),
                     fx=[("click", W("subscribe", 554), 0.45), ("notif", W("strangest", 558), 0.35)])),
]
